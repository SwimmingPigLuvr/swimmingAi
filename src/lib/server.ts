// src/lib/server.ts
import { OPENAI_API_KEY, ELEVEN_LABS_API_KEY } from '$env/static/private';
import WebSocket from 'ws';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { ElevenLabsClient } from 'elevenlabs';
import { chat } from '../stores/chatStore';

// init xi client
const elevenLabsClient = new ElevenLabsClient({
  apiKey: ELEVEN_LABS_API_KEY,
});

// voice ids
const drJoe = '4eLfPJnUx5enYbF4ZGcJ';
const matthew = '286VLndcKwmm1RxLQoOn';

// Variable to store the latest audio buffer
let latestAudioBuffer: Buffer | null = null;

export function getLatestAudioBuffer(): Buffer | null {
  return latestAudioBuffer;
}

export function setLatestAudioBuffer(buffer: Buffer | null) {
  latestAudioBuffer = buffer;
}

// Map to store user memories using usernames
const userMemories = new Map<string, any>();

// Function to get or initialize user memory
export async function getUserMemory(username: string) {
  if (!userMemories.has(username)) {
    userMemories.set(username, {
      username,
      lastSeen: null,
      messages: [],
      gifts: [],
      passHolder: false, // Update based on your logic
    });
  }
  return userMemories.get(username);
}

// Function to check if a message might be from a bot
function isPotentialBotMessage(message: string): boolean {
  const botMessages = ['gm', 'hello', 'hi', 'hey', 'good morning', 'good evening'];
  const normalizedMessage = message.trim().toLowerCase();
  return botMessages.includes(normalizedMessage);
}

// Function to generate personalized response using OpenAI
export async function generatePersonalizedResponse(
  username: string,
  chatMessage: string,
  userMemory: any
): Promise<string> {
  const openAiApiKey = OPENAI_API_KEY;
  const memoryFilePath = 'memory/global_memory.txt'; // Global memory or instructions

  let memoryFileContent = '';
  try {
    memoryFileContent = await fs.promises.readFile(memoryFilePath, 'utf-8');
  } catch (err) {
    console.error(`Error reading memory file: ${err}`);
  }

  // conversation history
  const messages = [
    { role: 'system', content: memoryFileContent },
  ];

  // add prev interactions
  userMemory.messages.forEach((msg: any) => {
    messages.push({ role: 'user', content: msg.content });
  });

  // add current message
  messages.push({ role: 'user', content: chatMessage });

  // additional context for user memory
  if (userMemory.gifts.length > 0) {
    messages.push({ role: 'system', content: `${username} has also sent you gifts before.` });
  }

  if (userMemory.passHolder) {
    messages.push({ role: 'system', content: `${username} holds your special pass and deserves extra attention.` });
  }

  const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: messages,
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!openAiResponse.ok) {
    const errorData = await openAiResponse.json();
    console.error(`Error from OpenAI API: ${openAiResponse.status} ${openAiResponse.statusText}`);
    console.error(`Error details: ${JSON.stringify(errorData)}`);
    return `Sorry, I'm having trouble responding right now.`;
  } else {
    const openAiResponseData = await openAiResponse.json();
    const generatedResponse = openAiResponseData.choices[0].message.content.trim();
    console.log(`Generated response: ${generatedResponse}`);
    return generatedResponse;
  }
}

// Function to generate speech using ElevenLabs
export async function generateSpeechWithElevenLabs(text: string): Promise<Buffer> {
  try {
    const audioStream = await elevenLabsClient.generate({
      text: text,
      voice: matthew,
      model_id: 'eleven_monolingual_v1',
    });

    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      const bufferChunk = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      chunks.push(bufferChunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    return audioBuffer;

  } catch (error) {
      console.error('error from elevenlabs api: ', error);
      throw new Error('failed to generate speech');
  }
}

// Function to check if a user holds your special pass (update logic as needed)
function checkIfPassHolder(username: string): boolean {
  // Implement your logic here
  // For example, check against a list of usernames
  const passHolders = ['special_user1', 'special_user2'];
  return passHolders.includes(username);
}

// Create WebSocket connection and process events
export function createWebSocketConnection() {
  const uniqueId = crypto.randomBytes(16).toString('hex');
  const streamerAddress = '0x5362c04666c92810f8fa72291a4ce60e51a128a2'; // Replace with your actual streamer address
  const WS_URL = `wss://chat.sanko.tv/ws?streamerAddress=${streamerAddress}&uniqueId=${uniqueId}`;

  const socket = new WebSocket(WS_URL, {
    headers: {
      'Pragma': 'no-cache',
      'Origin': 'https://sanko.tv',
      'Accept-Language': 'en-US,en;q=0.9',
      'User-Agent': 'Mozilla/5.0',
      'Cache-Control': 'no-cache',
    },
    perMessageDeflate: {
      clientMaxWindowBits: true,
    },
  });

  socket.on('open', () => {
    console.log(`Connected to Sanko.tv chat`);
  });

  socket.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      console.log(`Received message:`, JSON.stringify(message, null, 2));

      if (message.event === 'CHAT') {
        const senderName = message.data.event.sender.attributes.name;
        const chatMessage = message.data.event.content;

        // Check if the message might be from a bot
        if (isPotentialBotMessage(chatMessage)) {
          console.log(`potential bot message from ${senderName}: ${chatMessage}`);
          // uncomment this return statement if we want to enable bot detection later
          // return; 
        }

        // Get or initialize user memory
        const userMemory = await getUserMemory(senderName);

        // Update user memory
        userMemory.lastSeen = new Date().toISOString();
        userMemory.messages.push({
          content: chatMessage,
          timestamp: userMemory.lastSeen,
        });

        // Update pass holder status
        userMemory.passHolder = checkIfPassHolder(senderName);

        console.log(`Processing message from ${senderName}: ${chatMessage}`);

        // Generate personalized response
        const responseText = await generatePersonalizedResponse(
          senderName,
          chatMessage,
          userMemory
        );

        // Generate speech with ElevenLabs
        setLatestAudioBuffer(await generateSpeechWithElevenLabs(responseText));

        // Update user memory
        userMemories.set(senderName, userMemory);

        // add the message to the chatStore
        const chatMessageData: Message = {
          id: message.data.eventHash,
          username: senderName,
          content: chatMessage,
          timestamp: message.data.timestamp,
          passHolder: false, // todo implement passholder check
        };


      }

      // Handle 'GIFT' and other events similarly if needed

    } catch (error) {
      console.error(`Error processing message:`, error);
    }
  });

  socket.on('close', (code, reason) => {
    console.log(`Disconnected from Sanko.tv chat. Code: ${code}, Reason: ${reason}`);
    // Reconnection logic
    setTimeout(() => createWebSocketConnection(), 5000);
  });

  socket.on('error', (error) => {
    console.error(`WebSocket error:`, error);
  });

  const pingInterval = setInterval(() => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ event: 'PING' }));
    }
  }, 20000);
}

// Start the WebSocket connection when the server starts
createWebSocketConnection();

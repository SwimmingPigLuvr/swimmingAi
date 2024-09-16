// src/lib/server.ts
import { OPENAI_API_KEY, ELEVEN_LABS_API_KEY } from '$env/static/private';
import WebSocket from 'ws';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// voice ids
const drJoe = '4eLfPJnUx5enYbF4ZGcJ';
const matthew = '286VLndcKwmm1RxLQoOn';

// Variable to store the latest audio buffer
export let latestAudioBuffer: ArrayBuffer | null = null;

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

  // Create a personalized prompt
  let prompt = `${memoryFileContent}\n`;
  prompt += `\nThis is your previous interaction with ${username}:\n`;

  userMemory.messages.forEach((msg: any) => {
    prompt += `- ${msg.content} (at ${msg.timestamp})\n`;
  });

  if (userMemory.gifts.length > 0) {
    prompt += `${username} has also sent you gifts before.\n`;
  }

  if (userMemory.passHolder) {
    prompt += `${username} holds your special pass and deserves extra attention.\n`;
  }

  // Add the current message
  prompt += `\n${username} says: "${chatMessage}"\n\nRespond appropriately.`;

  const openAiResponse = await fetch('https://api.openai.com/v1/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openAiApiKey}`,
    },
    body: JSON.stringify({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!openAiResponse.ok) {
    console.error(`Error from OpenAI API: ${openAiResponse.status} ${openAiResponse.statusText}`);
    return `Sorry, I'm having trouble responding right now.`;
  } else {
    const openAiResponseData = await openAiResponse.json();
    const generatedResponse = openAiResponseData.choices[0].text.trim();
    console.log(`Generated response: ${generatedResponse}`);
    return generatedResponse;
  }
}

// Function to generate speech using ElevenLabs
export async function generateSpeechWithElevenLabs(text: string): Promise<ArrayBuffer> {
  const elevenLabsApiKey = ELEVEN_LABS_API_KEY;
  const elevenLabsVoiceId = 'your_voice_id'; // Replace with your ElevenLabs voice ID

  const speechResponse = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
    {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenLabsApiKey,
      },
      body: JSON.stringify({
        text: text,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    }
  );

  if (!speechResponse.ok) {
    console.error(
      `Error from ElevenLabs API: ${speechResponse.status} ${speechResponse.statusText}`
    );
    throw new Error('Failed to generate speech');
  } else {
    const speechAudioBuffer = await speechResponse.arrayBuffer();
    return speechAudioBuffer;
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
          console.log(`Ignored potential bot message from ${senderName}: ${chatMessage}`);
          return; // Do not process this message
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
        latestAudioBuffer = await generateSpeechWithElevenLabs(responseText);

        // Update user memory
        userMemories.set(senderName, userMemory);
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

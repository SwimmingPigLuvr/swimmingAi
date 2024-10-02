<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChatBox from "../lib/components/ChatBox.svelte";
  import { chat, type Message } from "../lib/stores/chatStore";
  import Terminal from "../lib/components/Terminal.svelte";

  const currentUser = "SwimmingPigLuvr";

  let chatBox = true;
  let terminal = false;

  let audio: HTMLAudioElement;
  let pollingInterval: NodeJS.Timeout;

  onMount(() => {
    // Initialize the Audio object inside onMount
    audio = new Audio();

    // fetch messages
    fetchMessages();

    // Start polling for new audio
    pollingInterval = setInterval(() => {
      fetchLatestAudio();
      fetchMessages();
    }, 3000);

    return () => {
      // Cleanup on component destroy
      clearInterval(pollingInterval);
      // Clean up the audio object if necessary
      audio = null;
    };
  });

  async function fetchMessages() {
    try {
      const response = await fetch("/api/messages");
      if (!response.ok) {
        console.error("!response.ok");
      }
      const newMessages: Message[] = await response.json();

      chat.update((currentMessages) => {
        const messageIds = new Set(currentMessages.map((msg) => msg.id));
        // filter out existing messages
        const uniqueNewMessages = newMessages.filter(
          (msg) => !messageIds.has(msg.id),
        );
        // combine current messages with unique messages
        return [...currentMessages, ...uniqueNewMessages];
      });
      // old method
      // chat.set(messages);
    } catch (error) {
      console.error("error fetching messages: ", error);
    }
  }

  async function fetchLatestAudio() {
    try {
      const response = await fetch(`/api/audio`);
      if (response.ok && response.status === 200) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        // Play the audio
        audio.src = audioUrl;
        await audio.play();

        // Release the object URL after the audio is done playing
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
        };
      } else if (response.status === 204) {
        // No new audio
      } else {
        console.error("Failed to fetch audio");
      }
    } catch (err) {
      console.error("Error fetching audio:", err);
    }
  }
</script>

{#if chatBox}
  <ChatBox {currentUser} />
{:else if terminal}
  <Terminal {currentUser} />
{/if}

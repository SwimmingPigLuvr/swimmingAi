<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { onMount } from "svelte";
  import ChatBox from "../lib/components/ChatBox.svelte";
  import { chat } from "$stores/chatBox";

  const currentUser = "swimmingPigLuvr";

  let audio: HTMLAudioElement;
  let pollingInterval: any;

  onMount(() => {
    // Initialize the Audio object inside onMount
    audio = new Audio();

    // Start polling for new audio
    pollingInterval = setInterval(fetchLatestAudio, 3000); // Poll every 3 seconds

    return () => {
      // Cleanup on component destroy
      clearInterval(pollingInterval);
      // Clean up the audio object if necessary
      audio = null;
    };
  });

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
        console.log("No new audio");
      } else {
        console.error("Failed to fetch audio");
      }
    } catch (err) {
      console.error("Error fetching audio:", err);
    }
  }
</script>

<ChatBox messages={$chat} {currentUser} />

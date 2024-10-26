<!-- src/lib/components/Terminal.svelte -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { chat, type Message } from "../stores/chatStore";
    import { fade, fly } from "svelte/transition";
    import { backOut, cubicInOut } from "svelte/easing";
    import { spring } from "svelte/motion";

    export let currentUser: string = "";

    // write a function that takes in a timestamp in this format
    // @2024-09-25T03:51:11.078Z
    // and parses it into english
    // can you make it abbreviate into this format
    // TUES 9.24.2024 8:51:11 PM
    function parseTimestampToEnglish(timestamp: string): string {
        const date = new Date(timestamp);
        const days = ["SUN", "MON", "TUES", "WED", "THURS", "FRI", "SAT"];
        const dayName = days[date.getUTCDay()];
        const month = date.getUTCMonth() + 1; // months are zero-based
        const day = date.getUTCDate();
        const year = date.getUTCFullYear();
        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes().toString().padStart(2, "0");
        const seconds = date.getUTCSeconds().toString().padStart(2, "0");
        const period = hours >= 12 ? "PM" : "AM";
        const formattedHours = hours % 12 || 12; // convert to 12-hour format

        return `${dayName} ${month}.${day}.${year} ${formattedHours}:${minutes}:${seconds} ${period}`;
    }

    let messages: Message[] = [];
    const unsubscribe = chat.subscribe((value) => {
        messages = value;
    });

    onDestroy(() => {
        unsubscribe();
    });

    function shouldShowUsername(index: number, messages: Message[]): boolean {
        if (index === 0) return true;
        return (
            messages[index - 1]?.user.username !==
            messages[index]?.user.username
        );
    }

    let chatContainer: HTMLDivElement;

    onMount(() => {
        scrollToBottom();
    });

    $: if (messages) {
        scrollToBottom();
    }

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
</script>

<div
    bind:this={chatContainer}
    class="bg-black w-full flex flex-col space-y8 p-4 overflow-y-auto h-screen"
>
    {#each messages as message, index (message.id)}
        <div class="my-1 flex items-start">
            <div
                in:fly={{ y: 20, duration: 500, easing: cubicInOut }}
                class="flex space-x-2 items-start"
            >
                {#if message.user.pfp}
                    <img
                        src={message.user.pfp}
                        alt=""
                        class="border-2 border-black rounded-full w-8 h-8 object-cover"
                    />
                {:else}
                    <div
                        class="rounded-full text-xl w-8 h-8 border-red-700 border-2 text-white font-black flex items-center justify-center"
                    >
                        {#if message.user?.username}
                            {message.user.username.charAt(0)}
                        {/if}
                    </div>
                {/if}
                <div class="py-0 font-mono text-2xl text-white">
                    <span
                        class={message.user.username === currentUser
                            ? "text-cyan-400"
                            : "text-lime-400"}
                    >
                        {message.user.username === currentUser
                            ? currentUser
                            : message.user.username}
                    </span>
                    {message.content}
                </div>
            </div>
        </div>
    {/each}
</div>

<style>
    .terminal-glow {
        text-shadow:
            0 0 1px rgba(255, 255, 255),
            0 0 2px rgba(255, 255, 255);
    }
</style>

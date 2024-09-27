<!-- src/lib/components/Terminal.svelte -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { chat, type Message } from "../stores/chatStore";
    import { fade, fly } from "svelte/transition";
    import { backOut } from "svelte/easing";

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
        {#if message.user?.username === currentUser}
            <div class="my-2 flex items-center">
                <!-- my messages / ai messages -->
                <div
                    in:fade={{ duration: 5000 }}
                    class=" flex space-x-2 items-center"
                >
                    <div
                        in:fly={{ x: 100, duration: 1000, easing: backOut }}
                        class="flex flex-col space-y-2 w-full items-start"
                    >
                        {#if message.user.pfp}
                            <img
                                src={message.user.pfp}
                                alt=""
                                class="border-2 border-black rounded-none w-10 h-full object-cover"
                            />
                        {:else}
                            <!-- <div class="text-xs text-gray-600">
                                {parseTimestampToEnglish(message.timestamp)}
                            </div> -->
                        {/if}
                        {#if shouldShowUsername(index, messages)}
                            <div class="text-xs text-white">
                                {currentUser}:
                            </div>
                        {/if}
                        <div
                            class="text-red-400 font-mono -tracking-wide leading-snug"
                        >
                            {message.content}
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <!-- chats from viewers -->
            <div class="flex space-x-2 items-center">
                {#if message.user.pfp}
                    <img
                        src={message.user.pfp}
                        alt=""
                        class="rounded-none w-auto h-4"
                    />
                {:else}
                    <div
                        class="rounded-none w-4 h-4 bg-gray-300 flex items-center justify-center"
                    >
                        {#if message.user?.username}
                            {message.user.username.charAt(0)}
                        {/if}
                    </div>
                {/if}
                {#if shouldShowUsername(index, messages)}
                    <!-- <p class="text-xs -tracking-widest text-gray-600">
                        {parseTimestampToEnglish(message.timestamp)}
                    </p> -->
                    <div class="text-xs ml-1">
                        <div class="flex space-x-1">
                            {#if message.passholder}
                                <img
                                    src="/icons/pass.png"
                                    alt=""
                                    class="w-4 h-4"
                                />
                            {/if}
                            <p class="text-white">
                                {message.user.username}:
                            </p>
                        </div>
                    </div>
                {/if}
                <div
                    class="leading-snug text-lime-400 font-mono -tracking-widest"
                >
                    {message.content}
                </div>
            </div>
        {/if}
    {/each}
</div>

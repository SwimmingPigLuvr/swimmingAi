<!-- src/lib/components/ChatBox.svelte -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { chat } from "../stores/chatStore";
    import { fade, fly } from "svelte/transition";
    import { backOut } from "svelte/easing";

    interface Message {
        id: string;
        username: string;
        content: string;
        timestamp: string;
        passholder: boolean;
    }

    export let currentUser: string = "";

    let messages: Message[] = [];
    const unsubscribe = chat.subscribe((value) => {
        messages = value;
        console.log("messages in chatbox:", messages);
    });

    onDestroy(() => {
        unsubscribe();
    });

    function shouldShowUsername(index: number, messages: Message[]): boolean {
        if (index === 0) return true;
        return messages[index - 1]?.username !== messages[index]?.username;
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
    class="m-auto flex flex-col space-y-3 p-4 overflow-y-auto h-full"
>
    {#each messages as message, index (message.id)}
        {#if message.username === currentUser}
            <!-- ai messages -->
            <div
                in:fade={{ duration: 5000 }}
                class="flex flex-col mb-2 items-end"
            >
                <div
                    in:fly={{ x: 100, duration: 1000, easing: backOut }}
                    class="flex flex-col w-full justify-end items-end"
                >
                    {#if shouldShowUsername(index, messages)}
                        <div
                            class="text-xs -tracking-wide mb-0 mr-1 text-right"
                        >
                            {currentUser}
                        </div>
                    {/if}
                    <div
                        class="max-w-[80%] px-4 py-2 bg-blue-700 text-white rounded-2xl rounded-tr-none text-base font-sans"
                    >
                        {message.content}
                    </div>
                </div>
            </div>
        {:else}
            <!-- chats from viewers -->
            <div class="flex flex-col mb-2 items-start">
                {#if shouldShowUsername(index, messages)}
                    <div class="text-xs mb-0 ml-1">
                        {message.username}
                        {#if message.passholder}
                            🪲
                            <span
                                class="inline-block w-4 h-4 ml-1 bg-no-repeat bg-contain"
                                style="background-image: url('/icons/pass.png');"
                            ></span>
                        {/if}
                    </div>
                {/if}
                <div
                    class="max-w-[80% px-4 py-2 bg-gray-200 text-black rounded-2xl rounded-tl-none text-base font-sans]"
                >
                    {message.content}
                </div>
            </div>
        {/if}
    {/each}
</div>

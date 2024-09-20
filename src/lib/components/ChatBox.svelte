<!-- src/lib/components/ChatBox.svelte -->
<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { chat, type Message } from "../stores/chatStore";
    import { fade, fly } from "svelte/transition";
    import { backOut } from "svelte/easing";

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
        return messages[index - 1]?.user.username !== messages[index]?.user.username;
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
    class="m-auto flex flex-col space-y-3 p-2 overflow-y-auto h-full"
>
    {#each messages as message, index (message.id)}
        {#if message.user.username === currentUser}
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
                        class="max-w-[80%] px-4 py-2 bg-blue-700 text-white rounded-2xl rounded-tr-none text-base font-mono -tracking-widest"
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
                        <p>{message.user.username}</p>
                        <p class="-tracking-widest text-[0.7em] text-gray-400">
                            @{message.timestamp}
                        </p>
                        {#if message.passholder}
                            🪲
                            <span
                                class="inline-block w-4 h-4 ml-1 bg-no-repeat bg-contain"
                                style="background-image: src('/icons/pass.png');"
                            ></span>
                        {/if}
                    </div>
                {/if}
                <div class="flex space-x-1 max-w-[80%] items-end">
                    <img
                        src={message.user.pfp}
                        alt=""
                        class="rounded-none w-8 h-8"
                    />
                    <div
                        class=" px-4 py-2 bg-gray-200 text-black rounded-2xl rounded-tl-none font-mono -tracking-widest"
                    >
                        {message.content}
                    </div>
                </div>
            </div>
        {/if}
    {/each}
</div>

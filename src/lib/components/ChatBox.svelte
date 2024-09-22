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
    class="bg-black rounded-[100px] pt-28 w-full flex flex-col space-y-8 p-4 overflow-y-auto h-screen"
>
    {#each messages as message, index (message.id)}
        {#if message.user?.username === currentUser}
            <div class="flex space-x-1 justify-end items-end">
                <!-- my messages / ai messages -->
                <div in:fade={{ duration: 5000 }} class="flex flex-col items-">
                    <div
                        in:fly={{ x: 100, duration: 1000, easing: backOut }}
                        class="flex flex-col w-full justify-end items-end"
                    >
                        {#if shouldShowUsername(index, messages)}
                            <div
                                class="text-white -tracking-wide mr-1 text-left"
                            >
                                {currentUser}
                            </div>
                        {/if}
                        <div
                            class="text-5xl max-w-[70%] px-12 py-8 bg-blue-700 text-white rounded-[50px] font-black rounded-tr-none font-mono -tracking-wide leading-snug"
                        >
                            {message.content}
                        </div>
                    </div>
                </div>
                {#if message.user.pfp}
                    <img
                        src={message.user.pfp}
                        alt=""
                        class="rounded-full w-20 h-20 object-cover"
                    />
                {:else}
                    <div
                        class="rounded-full w-20 h-20 bg-gray-300 flex items-center justify-center"
                    >
                        {#if message.user?.username}
                            {message.user.username.charAt(0)}
                        {/if}
                    </div>
                {/if}
            </div>
        {:else}
            <!-- chats from viewers -->
            <div class="flex space-x-2 items-end max-w-[70%]">
                {#if message.user.pfp}
                    <img
                        src={message.user.pfp}
                        alt=""
                        class=" rounded-full w-20 h-20 object-cover"
                    />
                {:else}
                    <div
                        class="rounded-full w-20 h-20 bg-gray-300 flex items-center justify-center"
                    >
                        {#if message.user?.username}
                            {message.user.username.charAt(0)}
                        {/if}
                    </div>
                {/if}
                <div class="flex flex-col justify-end">
                    {#if shouldShowUsername(index, messages)}
                        <div class="text-xs ml-1">
                            <div class="flex space-x-1">
                                {#if message.passholder}
                                    <img
                                        src="/icons/pass.png"
                                        alt=""
                                        class="w-8 h-8"
                                    />
                                {/if}
                                <p class="text-4xl text-white font-black">
                                    {message.user.username}
                                </p>
                            </div>
                            <p class="text-xl -tracking-widest text-gray-400">
                                @{message.timestamp}
                            </p>
                        </div>
                    {/if}
                    <div
                        class="font-black leading-snug text-5xl px-12 py-8 bg-gray-200 text-black rounded-[50px] rounded-tl-none font-mono -tracking-wide"
                    >
                        {message.content}
                    </div>
                </div>
            </div>
        {/if}
    {/each}
</div>

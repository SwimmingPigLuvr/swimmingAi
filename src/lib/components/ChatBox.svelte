<!-- src/lib/components/ChatBox.svelte -->
<script lang="ts">
    import { onDestroy } from "svelte";
    import { chat } from "../stores/chatStore";

    interface Message {
        id: string;
        username: string;
        content: string;
        timestamp: string;
        passholder: boolean;
    }

    export let currentUser: string = "";

    $: messages = $chat;
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

    $: scrollToBottom();

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
            <div class="flex flex-col mb-2 items-end">
                {#if shouldShowUsername(index, messages)}
                    <div class="text-xs -tracking-wide mb-0 mr-1 text-right">
                        {currentUser}
                    </div>
                {/if}
                <div
                    class="max-w-[60%] px-4 py-2 bg-blue-700 text-white rounded-2xl rounded-tr-none text-base font-sans"
                >
                    {message.content}
                </div>
            </div>
        {:else}
            <!-- chats from viewers -->
            <div class="flex flex-col mb-2 items-start">
                {#if shouldShowUsername(index, messages)}
                    <div class="text-xs mb-0 ml-1">
                        {message.username}
                        {#if message.passholder}
                            <span
                                class="inline-block w-4 h-4 ml-1 bg-no-repeat bg-contain"
                                style="background-image: url('/icons/pass.png');"
                            ></span>
                        {/if}
                    </div>
                {/if}
                <div
                    class="max-w-[60% px-4 py-2 bg-gray-200 text-black rounded-2xl rounded-tl-none text-base font-sans]"
                >
                    {message.content}
                </div>
            </div>
        {/if}
    {/each}
</div>

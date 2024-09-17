<!-- src/lib/components/ChatBox.svelte -->
<script lang="ts">
    export let messages: Message[] = [];
    export let currentUser: string = "";

    interface Message {
        id: string;
        username: string;
        content: string;
        timestamp: string;
        passHolder?: boolean;
    }

    function shouldShowUsername(index: number): boolean {
        if (index === 0) return true;
        return messages[index - 1].username !== messages[index].username;
    }

    import { onMount } from "svelte";

    let chatContainer: HTMLDivElement;

    $: scrollToBottom();

    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
</script>

<div bind:this={chatContainer} class="chat-container">
    {#each messages as message, index}
        {#if message.username === currentUser}
            <div class="message-group">
                {#if shouldShowUsername(index)}
                    <div class="username">You</div>
                {/if}
                <div class="message right">
                    {message.content}
                </div>
            </div>
        {:else}
            <div class="message-group">
                {#if shouldShowUsername(index)}
                    <div
                        class="username {message.passHolder
                            ? 'passholder'
                            : ''}"
                    >
                        {message.username}
                        {#if message.passHolder}
                            <span class="passholder-icon"></span>
                        {/if}
                    </div>
                {/if}
                <div class="message left">
                    {message.content}
                </div>
            </div>
        {/if}
    {/each}
</div>

<style>
    .chat-container {
        display: flex;
        flex-direction: column;
        padding: 16px;
        overflow-y: auto;
        height: 100%; /* Adjust as needed */
    }

    .message-group {
        display: flex;
        flex-direction: column;
        margin-bottom: 8px;
    }

    .message {
        max-width: 60%;
        padding: 10px 14px;
        border-radius: 20px;
        margin-bottom: 4px;
        word-wrap: break-word;
        font-size: 16px;
    }

    .message.left {
        align-self: flex-start;
        background-color: #f1f0f0;
        color: #000;
        border-top-left-radius: 0;
    }

    .message.right {
        align-self: flex-end;
        background-color: #007aff;
        color: #fff;
        border-top-right-radius: 0;
    }

    .username {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 4px;
        margin-left: 4px;
    }

    .username.passholder {
        color: gold;
        display: flex;
        align-items: center;
    }

    .passholder-icon {
        width: 16px;
        height: 16px;
        margin-left: 4px;
        background-image: url("/icons/passholder.svg"); /* Replace with your icon path */
        background-size: contain;
        background-repeat: no-repeat;
    }

    .message {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
            Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    }
</style>

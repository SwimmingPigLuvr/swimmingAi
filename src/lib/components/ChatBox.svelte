<script lang="ts">
    // chat boxes
    export let messages: Message[] = [];
    export let currentUser: string = "";

    interface Message {
        id: string;
        username: string;
        content: string;
        timestamp: string;
        passholder: boolean;
    }

    function showUserName(index: number) {
        if (index === 0) return true;
        return messages[index - 1].username !== messages[index].username;
    }
</script>

<div class="chat-container">
    {#each messages as message, index}
        {#if message.username === currentUser}
            <div class="message-group">
                {#if showUserName(index)}
                    <div class="username">{currentUser}</div>
                {/if}
                <div class="message right">
                    {message.content}
                </div>
            </div>
        {:else}
            <div class="message-group">
                {#if showUserName(index)}
                    <div class="username {message.passholder ? 'passholder' : ''}">
                        {message.username}
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
        background-color: #e5e5ea;
        color: #000;
        border-top-left-radius: 0;
    }

    .message.right {
        align-self: flex-end;
        background-color: #0b93f6;
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
        /* Style for passholder usernames */
        color: gold;
    }
</style>

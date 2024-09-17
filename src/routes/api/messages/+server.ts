// src/routes/api/messages/+server.ts
import type { RequestHandler } from "./$types";
import { chatStore } from "$lib/server";

export const GET: RequestHandler = async () => {
    try {
        // return json
        return new Response(JSON.stringify(chatStore), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('error fetching messages:', error);
        return new Response('internal server error', { status: 500 });
    }
};

// src/lib/stores/chatStores.ts
import { writable } from 'svelte/store';

export interface Message {
    id: string;
    username: string;
    content: string;
    timestamp: string;
    passholder: boolean;
}

export const chat = writable<Message[]>([]);

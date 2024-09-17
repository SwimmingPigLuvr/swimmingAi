// src/routes/api/audio/+server.ts
import type { RequestHandler } from './$types';
import { getLatestAudioBuffer, setLatestAudioBuffer } from '$lib/server';

export const GET: RequestHandler = async () => {
  const audioBuffer = getLatestAudioBuffer();
  if (audioBuffer) {
    // Reset latestAudioBuffer after sending it to the client
    setLatestAudioBuffer(null);
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } else {
    // No new audio; return a 204 No Content response without a body
    return new Response(null, { status: 204 });
  }
};

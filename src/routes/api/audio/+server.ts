// src/routes/api/audio/+server.ts
import type { RequestHandler } from './$types';
import { latestAudioBuffer } from '$lib/server';

export const GET: RequestHandler = async () => {
  if (latestAudioBuffer) {
    const audioBuffer = latestAudioBuffer;
    // Reset latestAudioBuffer after sending it to the client
    latestAudioBuffer = null;
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } else {
    // No new audio
    return new Response('No new audio', { status: 204 });
  }
};

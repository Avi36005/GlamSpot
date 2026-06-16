import { GLAMBOT_SYSTEM } from "./ai";
import type { ChatMessage } from "./types";

/**
 * Returns the pool of Groq API keys configured in the environment.
 */
function getKeys(): string[] {
  const keysStr = process.env.GROQ_API_KEYS || process.env.GROQ_API_KEY || "";
  return keysStr
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);
}

// Global index of the active working key to prevent unnecessary rotating/retrying on every request
let currentKeyIndex = 0;

/**
 * Executes a streaming chat completion request to the Groq API,
 * automatically rotating through the key pool if a key is rate-limited (429),
 * unauthorized (401/403), or faces transient errors (5xx).
 */
export async function fetchGroqChatStream(messages: ChatMessage[]): Promise<Response> {
  const keys = getKeys();
  if (keys.length === 0) {
    throw new Error("No Groq API keys found in the environment configuration.");
  }

  for (let attempt = 0; attempt < keys.length; attempt++) {
    const keyIndex = (currentKeyIndex + attempt) % keys.length;
    const apiKey = keys[keyIndex];

    console.log(`[Groq Rotation] Attempting chat request with key index ${keyIndex} / ${keys.length}`);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          stream: true,
          temperature: 0.6,
          messages: [
            { role: "system", content: GLAMBOT_SYSTEM },
            ...messages,
          ],
        }),
      });

      // Handle rate limit (429) or authentication issues (401, 403) by rotating key
      if (res.status === 429) {
        console.warn(`[Groq Rotation] Key index ${keyIndex} rate limited (429). Rotating...`);
        continue;
      }
      if (res.status === 401 || res.status === 403) {
        console.warn(`[Groq Rotation] Key index ${keyIndex} returned authentication failure (${res.status}). Rotating...`);
        continue;
      }

      // Handle transient server errors by rotating key
      if (res.status >= 500) {
        console.warn(`[Groq Rotation] Key index ${keyIndex} hit Groq server error (${res.status}). Rotating...`);
        continue;
      }

      // If we got a successful response, lock in this working key index and return the response
      if (res.ok) {
        currentKeyIndex = keyIndex;
        return res;
      }

      // If it is another client-side error (e.g. 400 Bad Request), do not rotate, return directly
      return res;
    } catch (err) {
      console.error(`[Groq Rotation] Failed fetch with key index ${keyIndex}:`, err);
      // If this was our last attempt, throw the error
      if (attempt === keys.length - 1) {
        throw err;
      }
    }
  }

  throw new Error("All Groq API keys in the rotation pool have failed or been exhausted.");
}

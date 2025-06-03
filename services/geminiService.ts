
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { GEMINI_MODEL_TEXT, GEMINI_MODEL_IMAGE } from '../constants';

// Ensure API_KEY is available. In a real app, this would be more robustly managed.
const NEXT_PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY;

if (!NEXT_PUBLIC_API_KEY) {
  console.error("Gemini API Key is not configured. Please set the API_KEY environment variable.");
  // Potentially throw an error or use a mock implementation if key is essential for app to run
}

const ai = new GoogleGenAI({ apiKey: NEXT_PUBLIC_API_KEY || "MISSING_API_KEY" }); // Provide a fallback to prevent crash if key is missing

/**
 * Generates text content using the Gemini API.
 * @param prompt The text prompt.
 * @param systemInstruction Optional system instruction for the model.
 * @returns The generated text.
 */
export const generateText = async (prompt: string, systemInstruction?: string): Promise<string> => {
  if (!NEXT_PUBLIC_API_KEY) return "API Key not configured. Cannot connect to Gemini.";
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
        // thinkingConfig: { thinkingBudget: 0 } // Example: disable thinking for low latency
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    return `Error: Could not generate text. ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Generates text content and expects a JSON response.
 * @param prompt The text prompt.
 * @param systemInstruction Optional system instruction for the model.
 * @returns The parsed JSON object or array.
 */
export const generateJson = async <T,>(prompt: string, systemInstruction?: string): Promise<T | null> => {
  if (!NEXT_PUBLIC_API_KEY) {
    console.error("API Key not configured. Cannot connect to Gemini for JSON generation.");
    return null;
  }
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        ...(systemInstruction && { systemInstruction }),
        responseMimeType: "application/json",
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    try {
      return JSON.parse(jsonStr) as T;
    } catch (parseError) {
      console.error("Failed to parse JSON response from Gemini:", parseError, "Raw response:", jsonStr);
      throw new Error(`Failed to parse JSON response. Raw text: ${jsonStr}`);
    }
  } catch (error) {
    console.error("Error generating JSON with Gemini:", error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Generates images using the Gemini API.
 * @param prompt The text prompt for image generation.
 * @param numberOfImages Number of images to generate.
 * @returns Array of base64 encoded image strings.
 */
export const generateImages = async (prompt: string, numberOfImages: number = 1): Promise<string[]> => {
  if (!NEXT_PUBLIC_API_KEY) return ["API Key not configured. Cannot generate images."];
  try {
    const response = await ai.models.generateImages({
        model: GEMINI_MODEL_IMAGE,
        prompt: prompt,
        config: {numberOfImages: numberOfImages, outputMimeType: 'image/jpeg'},
    });
    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
  } catch (error) {
    console.error("Error generating images with Gemini:", error);
    return [`Error: Could not generate images. ${error instanceof Error ? error.message : String(error)}`];
  }
};


let chatInstance: Chat | null = null;

/**
 * Creates or retrieves a chat instance.
 * @param systemInstruction Optional system instruction for the chat.
 * @returns The chat instance.
 */
const getChat = (systemInstruction?: string): Chat => {
  if (!NEXT_PUBLIC_API_KEY) {
    throw new Error("API Key not configured. Cannot initialize chat");
  }
  // For simplicity, this example re-creates chat if systemInstruction changes or if not initialized.
  // A more robust app might manage multiple chat instances or update existing ones.
  if (!chatInstance || (systemInstruction && (chatInstance as any)._systemInstruction !== systemInstruction) ) {
     chatInstance = ai.chats.create({
        model: GEMINI_MODEL_TEXT,
        ...(systemInstruction && { config: { systemInstruction } }),
     });
     // Store systemInstruction if you need to check it later, e.g., on the chatInstance if API allows or locally
     // (chatInstance as any)._systemInstruction = systemInstruction; 
  }
  return chatInstance;
};

/**
 * Sends a message in an ongoing chat session.
 * @param message The message to send.
 * @param systemInstruction Optional system instruction (will re-initialize chat if different from current).
 * @returns The chat response text.
 */
export const sendChatMessage = async (message: string, systemInstruction?: string): Promise<string> => {
  if (!NEXT_PUBLIC_API_KEY) return "API Key not configured. Cannot send chat message.";
  try {
    const chat = getChat(systemInstruction);
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending chat message with Gemini:", error);
    return `Error in chat: ${error instanceof Error ? error.message : String(error)}`;
  }
};

/**
 * Generates text content using Google Search grounding.
 * @param prompt The text prompt.
 * @returns The generated text and grounding metadata.
 */
export const generateTextWithGoogleSearch = async (prompt: string): Promise<{ text: string; sources: any[] }> => {
  if (!NEXT_PUBLIC_API_KEY) return { text: "API Key not configured. Cannot connect to Gemini.", sources: [] };
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      }
    });
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return { text: response.text, sources };
  } catch (error) {
    console.error("Error generating text with Google Search grounding:", error);
    return { 
      text: `Error: Could not generate text with Google Search. ${error instanceof Error ? error.message : String(error)}`,
      sources: []
    };
  }
};

// Example of streaming chat (implementation would require UI updates per chunk)
export const sendChatMessageStream = async (
  message: string,
  onChunk: (chunkText: string) => void,
  systemInstruction?: string
): Promise<void> => {
  if (!NEXT_PUBLIC_API_KEY) {
    onChunk("API Key not configured. Cannot send chat message.");
    return;
  }
  try {
    const chat = getChat(systemInstruction);
    const stream = await chat.sendMessageStream({ message });
    for await (const chunk of stream) {
      onChunk(chunk.text);
    }
  } catch (error) {
    console.error("Error in streaming chat message with Gemini:", error);
    onChunk(`Error in chat stream: ${error instanceof Error ? error.message : String(error)}`);
  }
};

// Basic helper to parse JSON, now integrated into generateJson
// export const parseJsonFromText = <T,>(text: string): T | null => {
//   let jsonStr = text.trim();
//   const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
//   const match = jsonStr.match(fenceRegex);
//   if (match && match[2]) {
//     jsonStr = match[2].trim();
//   }
//   try {
//     return JSON.parse(jsonStr) as T;
//   } catch (e) {
//     console.error("Failed to parse JSON from text:", e, "Raw text:", text);
//     return null;
//   }
// };


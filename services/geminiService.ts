import { GoogleGenAI } from "@google/genai";
import { CrystalType } from "../types";

// The API key must be obtained exclusively from process.env.API_KEY.
// We initialize lazily inside the function to prevent the entire app from crashing 
// on load if the key is missing (e.g., in a GitHub Pages demo without secrets).

export const streamCrystalExplanation = async (
  message: string,
  currentType: CrystalType,
  onChunk: (text: string) => void
) => {
  // Use gemini-3-pro-preview for Complex Text Tasks (STEM) as per guidelines.
  const modelId = "gemini-3-pro-preview"; 
  const systemInstruction = `You are a helpful and knowledgeable materials science tutor specializing in crystallography. 
  The user is currently looking at a 3D visualization of a ${currentType} (Face-Centered Cubic or Body-Centered Cubic) crystal structure.
  
  Context:
  - If current type is FCC: Highlight that it has atoms at corners and face centers, 74% packing efficiency, 4 octahedral voids, 8 tetrahedral voids.
  - If current type is BCC: Highlight atoms at corners and body center, 68% packing efficiency, distorted octahedral voids.
  
  Answer the user's question concisely and accurately in Chinese (unless they ask in English). Use Markdown for formatting.`;

  try {
    // Initialize the client here to be safe
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const result = await chat.sendMessageStream({ message });
    
    for await (const chunk of result) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    onChunk("\n\n(AI 助教连接失败。请检查 API Key 配置，或稍后再试。)");
  }
};
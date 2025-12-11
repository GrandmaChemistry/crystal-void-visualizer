import { GoogleGenAI } from "@google/genai";
import { CrystalType } from "../types";

// Initialize Gemini Client
// The API key must be obtained exclusively from process.env.API_KEY.
// Assume it is valid and accessible as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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
    onChunk("\n\n(Error connecting to AI Tutor. Please try again later.)");
  }
};
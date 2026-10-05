import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "30mb" }));

const PORT = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ GEMINI_API_KEY is missing.");
}

const ai = new GoogleGenAI({
  apiKey: apiKey,
});

// Health check
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "AI Fruit Video Studio API",
    apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Gemini text generation
app.post("/api/generate", async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
    }

    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: "Prompt is required.",
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    res.json({
      success: true,
      text: response.text,
    });
  } catch (error) {
    console.error("Gemini error:", error);

    res.status(500).json({
      success: false,
      error: error?.message || "Gemini generation failed.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 AI Fruit Video Studio server running on port ${PORT}`);
});

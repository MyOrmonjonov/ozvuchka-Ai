import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config({ path: ".env.development.local" });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "10mb" }));

  // Helper for lazy Gemini AI instance
  function getGeminiClient() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY topilmadi. Iltimos, API kalitni Sozlamalar (Secrets) orqali kiriting.");
    }
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }

  // Voice mapping table
  const VOICE_MAP: Record<string, string> = {
    "Dilnoza": "Zephyr",
    "Madina": "Kore",
    "Sardor": "Puck",
    "Jasur": "Charon",
    "Farrux": "Fenrir",
  };

  // Style prompt map
  const STYLE_PROMPTS: Record<string, string> = {
    natural: "Quyidagi matnni tabiiy, aniq va ravon o'zbek tilida gapirib ber:",
    cheerful: "Quyidagi matnni xushchaqchaq, ko'tarinki va quvnoq ohangda gapirib ber:",
    calm: "Quyidagi matnni sokin, muloyim va vasfiy ohangda gapirib ber:",
    serious: "Quyidagi matnni jiddiy, rasmiy va vazmin ohangda gapirib ber:",
    dramatic: "Quyidagi matnni hayajonli, dramatik va ta'sirli ohangda gapirib ber:",
  };

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "O'zbek Ovoz AI" });
  });

  // Text-To-Speech Synthesis Endpoint
  app.post("/api/tts", async (req, res) => {
    try {
      const { text, voiceName = "Dilnoza", style = "natural", speed = 1.0 } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Matn kiritilmagan" });
      }

      if (text.length > 1200) {
        return res.status(400).json({ error: "Matn uzunligi 1200 belgidan oshmasligi kerak" });
      }

      const ai = getGeminiClient();

      const resolvedVoice = VOICE_MAP[voiceName] || "Zephyr";
      const styleInstruction = STYLE_PROMPTS[style] || STYLE_PROMPTS["natural"];
      const promptText = `${styleInstruction}\n\n${text.trim()}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: resolvedVoice },
            },
          },
        },
      });

      const candidate = response.candidates?.[0];
      const part = candidate?.content?.parts?.[0];
      const base64Audio = part?.inlineData?.data;

      if (!base64Audio) {
        throw new Error("Gemini AI modelidan audio ma'lumoti olinmadi");
      }

      return res.json({
        audioContent: base64Audio,
        sampleRate: 24000,
        text: text.trim(),
        voiceName,
        style,
        speed: Number(speed) || 1.0,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error("TTS Xatolik:", err);
      return res.status(500).json({
        error: err.message || "Ovoz sintez qilishda xatolik yuz berdi",
      });
    }
  });

  // Orthography Enhancer Endpoint (Gemini)
  app.post("/api/enhance-text", async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || typeof text !== "string" || text.trim().length === 0) {
        return res.status(400).json({ error: "Tahrirlash uchun matn kiritilmagan" });
      }

      const ai = getGeminiClient();

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: `Siz o'zbek tili va imlosi bo'yicha ekspert AI assistentsiz. Berilgan matnni tahrirlang, tutuq belgilarini (o' va g' uchun standart appostrof '), tinish belgilarini va grammatik kelishik/qo'shimchalarni to'g'rilang. Qaytarilgan matn faqat tahrirlangan tayyor o'zbekcha matndan iborat bo'lsin. Hech qanday qo'shimcha tushuntirish, sarlavha yoki belgilarsiz faqat to'g'rilangan matnning o'zini qaytaring.\n\nKiritilgan matn:\n${text}`,
      });

      const enhancedText = response.text ? response.text.trim() : text;

      return res.json({ enhancedText });
    } catch (err: any) {
      console.error("Imlo to'g'rilashda xatolik:", err);
      return res.status(500).json({
        error: err.message || "Matnni imlo va grammatika jihatidan tahrirlashda xatolik yuz berdi",
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  return app;
}

const app = await startServer();

if (!process.env.VERCEL) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

export default app;

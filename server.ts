import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "10mb" }));

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Server-side Gemini AI endpoint
  app.post("/api/ai/advisor", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY environment variable is missing on the server.",
        });
      }

      const { prompt, context } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
      }

      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `You are the Lab Resource Utilization Platform AI Assistant.
You specialize in university and research laboratory operations, equipment calibration management, scheduling optimization, safety protocol validation, and maintenance issue diagnosis.
Always give concise, professional, actionable insights and structured recommendations suitable for lab administrators, professors, technicians, and maintenance engineers.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\nContext: ${JSON.stringify(
                  context || {}
                )}\n\nQuery: ${prompt}`,
              },
            ],
          },
        ],
      });

      const reply = response.text || "No response generated from AI advisor.";
      return res.json({ reply });
    } catch (error: any) {
      console.error("Error in AI advisor endpoint:", error);
      return res.status(500).json({
        error: error.message || "An error occurred while communicating with Gemini AI.",
      });
    }
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

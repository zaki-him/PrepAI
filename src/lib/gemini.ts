import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function callGemini(
  systemPrompt: string,
  messages: { role: "user" | "model"; content: string }[]
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: systemPrompt,
  })

  const contents = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }))

  const result = await model.generateContent({ contents })
  return result.response.text()
}

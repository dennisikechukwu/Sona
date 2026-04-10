import Groq from "groq-sdk";
import { createRateLimiter } from "@/lib/ratelimit";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const ratelimit = createRateLimiter();
    const { success } = await ratelimit.limit(`transcribe_${ip}`);
    
    if (!success) {
      return Response.json({ error: "Rate limit exceeded. Too many transcriptions." }, { status: 429 });
    }
    const formData = await request.formData();
    const audioBlob = formData.get("audio") as File | null;

    if (!audioBlob) {
      return Response.json({ error: "No audio provided" }, { status: 400 });
    }

    const transcription = await groq.audio.transcriptions.create({
      file: audioBlob,
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: "en",
    });

    return Response.json({ text: transcription.text });
  } catch (err) {
    console.error("Transcription error:", err);
    return Response.json({ error: "Transcription failed" }, { status: 500 });
  }
}

export interface DetectionResult {
  classification: "HUMAN" | "AI_GENERATED";
  confidence: number;
  explanation: string;
}

const API_BASE =
  // In dev, Vite proxy handles /api -> http://127.0.0.1:8000
  import.meta.env.VITE_API_BASE_URL?.toString().trim() || "/api";

export async function detectVoice(audioBase64: string): Promise<DetectionResult> {
  if (!audioBase64?.trim()) {
    throw new Error("No audio data. Please upload a valid audio file.");
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE}/detect`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ audio_base64: audioBase64 }),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("fetch") || msg.includes("Failed") || msg.includes("Network")) {
      throw new Error("Cannot reach the server. Make sure the backend is running: cd backend && python -m uvicorn app:app --port 8000");
    }
    throw err;
  }

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    let message = text || `Server error (${res.status})`;
    try {
      const json = JSON.parse(text) as { detail?: string | { msg?: string }[] };
      if (typeof json.detail === "string") message = json.detail;
      else if (Array.isArray(json.detail) && json.detail[0]?.msg) message = json.detail[0].msg;
    } catch {
      /* use message as-is */
    }
    throw new Error(message);
  }

  const data = JSON.parse(text) as DetectionResult;
  if (data.classification !== "HUMAN" && data.classification !== "AI_GENERATED") {
    data.classification = (data.confidence ?? 0) >= 0.5 ? "AI_GENERATED" : "HUMAN";
  }
  return data;
}


import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text;
    const speakerId = body.speaker || 3; // Default to Zundamon Normal

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const VOICEVOX_URL = "http://127.0.0.1:50021";

    // Step 1: Audio Query
    const queryResponse = await fetch(
      `${VOICEVOX_URL}/audio_query?text=${encodeURIComponent(
        text
      )}&speaker=${speakerId}`,
      { method: "POST" }
    );

    if (!queryResponse.ok) {
      throw new Error(`Voicevox Query Failed: ${queryResponse.statusText}`);
    }

    const queryJson = await queryResponse.json();

    // Step 2: Synthesis
    const synthesisResponse = await fetch(
      `${VOICEVOX_URL}/synthesis?speaker=${speakerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(queryJson),
      }
    );

    if (!synthesisResponse.ok) {
      throw new Error(
        `Voicevox Synthesis Failed: ${synthesisResponse.statusText}`
      );
    }

    const audioBuffer = await synthesisResponse.arrayBuffer();

    // Return Audio File
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/wav",
      },
    });
  } catch (error: any) {
    console.error("Voicevox Error:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate voice. Make sure VOICEVOX is running locally.",
      },
      { status: 500 }
    );
  }
}

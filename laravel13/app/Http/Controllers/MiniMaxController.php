<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MiniMaxController extends Controller
{
    public function index()
    {
        return view('minimax');
    }

    public function generateImage(Request $request)
    {
        $request->validate([
            'api_key' => 'required|string',
            'prompt' => 'required|string',
        ]);

        $apiKey = $request->api_key;
        $url = "https://api.minimax.io/v1/image_generation";

        $response = Http::withToken($apiKey)
            ->post($url, [
                "model" => "image-01",
                "prompt" => $request->prompt,
                "aspect_ratio" => "16:9",
                "response_format" => "base64",
            ]);

        if ($response->failed()) {
            return response()->json(['error' => $response->body()], 400);
        }

        $data = $response->json();
        $images = $data['data']['image_base64'] ?? [];
        
        // Return base64 for direct display
        return response()->json(['images' => $images]);
    }

    public function generateAudio(Request $request)
    {
        $request->validate([
            'api_key' => 'required|string',
            'text' => 'required|string',
            'voice_id' => 'required|string',
        ]);

        $apiKey = $request->api_key;
        $url = "https://api.minimax.io/v1/t2a_v2";

        $response = Http::withToken($apiKey)
            ->withHeaders(['Content-Type' => 'application/json'])
            ->post($url, [
                "model" => "speech-2.8-hd",
                "text" => $request->text,
                "stream" => false,
                "language_boost" => "auto",
                "voice_setting" => [
                    "voice_id" => $request->voice_id,
                    "speed" => 1.0,
                    "vol" => 1.0,
                    "pitch" => 0
                ],
                "audio_setting" => [
                    "sample_rate" => 32000,
                    "bitrate" => 128000,
                    "format" => "mp3",
                    "channel" => 1
                ]
            ]);

        if ($response->failed()) {
            return response()->json(['error' => $response->body()], 400);
        }

        $result = $response->json();
        if (($result['base_resp']['status_code'] ?? -1) !== 0) {
            return response()->json(['error' => $result['base_resp']['status_msg'] ?? 'Unknown error'], 400);
        }

        $audioHex = $result['data']['audio'] ?? null;
        if (!$audioHex) {
            return response()->json(['error' => 'No audio data received'], 400);
        }

        // Convert hex to base64 for easy playback in frontend
        $audioBinary = hex2bin($audioHex);
        $audioBase64 = base64_encode($audioBinary);

        return response()->json(['audio' => $audioBase64]);
    }
}

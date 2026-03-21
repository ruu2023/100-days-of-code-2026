<?php

namespace App\Http\Controllers;

use App\Services\YouTubeDownloader;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class YouTubeDownloadController extends Controller
{
    public function __construct(
        private YouTubeDownloader $downloader
    ) {}

    public function index()
    {
        return view('youtube.index');
    }

    public function download(Request $request): StreamedResponse|JsonResponse
    {
        $request->validate([
            'url' => 'required|url',
            'start' => 'nullable|string',
            'end' => 'nullable|string',
            'format' => 'nullable|in:mp4,mp3,audio',
        ]);

        try {
            return $this->downloader->getStreamedResponse(
                url: $request->input('url'),
                start: $request->input('start'),
                end: $request->input('end'),
                format: $request->input('format', 'mp4'),
            );
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
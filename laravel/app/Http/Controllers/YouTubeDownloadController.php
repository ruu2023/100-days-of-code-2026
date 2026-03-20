<?php

namespace App\Http\Controllers;

use App\Services\YouTubeDownloader;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class YouTubeDownloadController extends Controller
{
    public function __construct(
        private YouTubeDownloader $downloader
    ) {}

    public function index()
    {
        $files = $this->downloader->getFiles();
        return view('youtube.index', compact('files'));
    }

    public function download(Request $request): JsonResponse
    {
        $request->validate([
            'url' => 'required|url',
            'start' => 'nullable|string',
            'end' => 'nullable|string',
            'format' => 'nullable|in:mp4,mp3,audio',
        ]);

        $result = $this->downloader->download(
            url: $request->input('url'),
            start: $request->input('start'),
            end: $request->input('end'),
            format: $request->input('format', 'mp4'),
        );

        return response()->json($result);
    }

    public function files(): JsonResponse
    {
        return response()->json($this->downloader->getFiles());
    }

    public function delete(Request $request, string $filename): JsonResponse
    {
        $deleted = $this->downloader->deleteFile($filename);
        return response()->json(['success' => $deleted]);
    }
}
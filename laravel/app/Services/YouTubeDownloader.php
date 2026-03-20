<?php

namespace App\Services;

use Symfony\Component\HttpFoundation\StreamedResponse;

class YouTubeDownloader
{
    public function getStreamedResponse(string $url, ?string $start = null, ?string $end = null, string $format = 'mp4'): StreamedResponse
    {
        $section = $this->buildSection($start, $end);

        // まず動画情報を取得
        $info = $this->getVideoInfo($url);
        $filename = $info['title'] ?? 'video';
        $extension = $format === 'mp3' ? 'mp3' : 'mp4';
        $mimeType = $this->getMimeType($format);

        $command = [
            'yt-dlp',
            '-f', $this->getFormatSelector($format),
            '-o', '-',
            '--no-playlist',
        ];

        if ($section) {
            $command[] = '--download-sections';
            $command[] = $section;
        }

        $command[] = $url;

        $safeFilename = preg_replace('/[^\w\-\.]/', '_', $filename) . '.' . $extension;
        $safeFilename = mb_substr($safeFilename, 0, 200);

        $response = new StreamedResponse(function () use ($command) {
            // 出力バッファを全てクリア
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            // STDERR を STDOUT にリダイレクト
            $command[] = '2>&1';

            passthru(implode(' ', array_map('escapeshellarg', $command)));
        });

        $response->headers->set('Content-Type', $mimeType);
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $safeFilename . '"');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        return $response;
    }

    private function getVideoInfo(string $url): array
    {
        $command = ['yt-dlp', '--dump-json', '--no-playlist', $url];

        $output = shell_exec(implode(' ', array_map('escapeshellarg', $command)) . ' 2>/dev/null');
        $data = json_decode($output, true);

        if (!$data) {
            return ['title' => 'video_' . time()];
        }

        return [
            'title' => $data['title'] ?? 'video_' . time(),
        ];
    }

    private function getFormatSelector(string $format): string
    {
        return match ($format) {
            'mp3', 'audio' => 'bestaudio/best',
            default => 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
        };
    }

    private function buildSection(?string $start, ?string $end): ?string
    {
        if (!$start && !$end) {
            return null;
        }

        $section = '*';
        $section .= $start ? $this->parseTime($start) : '0';
        $section .= '-';
        $section .= $end ? $this->parseTime($end) : '';

        return $section;
    }

    private function parseTime(string $time): string
    {
        if (is_numeric($time)) {
            $seconds = (int) $time;
            $hours = floor($seconds / 3600);
            $minutes = floor(($seconds % 3600) / 60);
            $secs = $seconds % 60;
            return sprintf('%d:%02d:%02d', $hours, $minutes, $secs);
        }

        if (preg_match('/^\d+:\d+$/', $time)) {
            $parts = explode(':', $time);
            if (count($parts) === 2) {
                return '0:' . $parts[0] . ':' . $parts[1];
            }
        }

        return $time;
    }

    private function getMimeType(string $format): string
    {
        return match ($format) {
            'mp3', 'audio' => 'audio/mpeg',
            'webm' => 'video/webm',
            default => 'video/mp4',
        };
    }
}
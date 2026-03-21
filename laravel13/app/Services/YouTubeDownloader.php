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

        // 一時ファイルを作成 (storage/app/youtube ディレクトリ)
        $tempDir = storage_path('app/youtube');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $tempFile = $tempDir . '/' . uniqid('yt-', true) . '.' . $extension;

        $command = [
            'yt-dlp',
            '--quiet',
            '--no-warnings',
            '--no-playlist',
            '-f', $this->getFormatSelector($format),
            '-o', $tempFile,
        ];

        if ($format === 'mp3' || $format === 'audio') {
            $command[] = '-x';
            $command[] = '--audio-format';
            $command[] = 'mp3';
        } else {
            $command[] = '--merge-output-format';
            $command[] = 'mp4';
            // QuickTime 互換性のための FastStart (moov atom を先頭に)
            $command[] = '--postprocessor-args';
            $command[] = 'ffmpeg:-movflags +faststart';
        }

        if ($section) {
            $command[] = '--download-sections';
            $command[] = $section;
        }

        $command[] = $url;

        // 実行 (タイムリミットを解除して完了を待つ)
        set_time_limit(0);
        $commandStr = implode(' ', array_map('escapeshellarg', $command));
        exec($commandStr . ' 2>&1', $output, $returnVar);

        if ($returnVar !== 0 || !file_exists($tempFile) || filesize($tempFile) === 0) {
            $errorMsg = !empty($output) ? implode("\n", $output) : 'Unknown error';
            throw new \Exception('動画のダウンロードに失敗しました: ' . $errorMsg);
        }

        $safeFilename = preg_replace('/[^\w\-\.]/', '_', $filename) . '.' . $extension;
        $safeFilename = mb_substr($safeFilename, 0, 200);

        $response = new StreamedResponse(function () use ($tempFile) {
            // 出力バッファを全てクリア
            while (ob_get_level() > 0) {
                ob_end_clean();
            }

            $stream = fopen($tempFile, 'rb');
            if ($stream) {
                fpassthru($stream);
                fclose($stream);
            }
            
            // 送信完了後に一時ファイルを削除
            if (file_exists($tempFile)) {
                @unlink($tempFile);
            }
        });

        $response->headers->set('Content-Type', $mimeType);
        $response->headers->set('Content-Disposition', 'attachment; filename="' . $safeFilename . '"');
        $response->headers->set('Cache-Control', 'no-cache');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('Content-Length', filesize($tempFile));

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
            default => 'bestvideo[vcodec^=avc1][ext=mp4]+bestaudio[acodec^=mp4a][ext=m4a]/best[vcodec^=avc1][ext=mp4]/best[ext=mp4]/best',
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
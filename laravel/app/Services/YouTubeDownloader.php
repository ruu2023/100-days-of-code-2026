<?php

namespace App\Services;

use Symfony\Component\Process\Process;

class YouTubeDownloader
{
    private string $storagePath;

    public function __construct()
    {
        $this->storagePath = storage_path('app/downloads');
        if (!is_dir($this->storagePath)) {
            mkdir($this->storagePath, 0755, true);
        }
    }

    public function download(string $url, ?string $start = null, ?string $end = null, string $format = 'mp4'): array
    {
        $section = $this->buildSection($start, $end);
        $outputTemplate = $this->storagePath . '/%(title)s_%(' . time() . ')s.%(ext)s';

        $command = [
            'yt-dlp',
            '-f', $this->getFormatSelector($format),
            '-o', $outputTemplate,
        ];

        if ($section) {
            $command[] = '--download-sections';
            $command[] = $section;
        }

        $command[] = '--no-playlist';
        $command[] = '--newline';
        $command[] = '-v';
        $command[] = $url;

        $process = new Process($command);
        $process->setTimeout(300);

        $output = [];
        $error = [];

        $process->run(function ($type, $buffer) use (&$output, &$error) {
            if ($type === Process::OUT) {
                $output[] = $buffer;
            } else {
                $error[] = $buffer;
            }
        });

        $files = glob($this->storagePath . '/*.' . $format);

        return [
            'success' => $process->isSuccessful(),
            'files' => $files ? array_map('basename', $files) : [],
            'output' => implode('', $output),
            'error' => implode('', $error),
        ];
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
        // 秒数で入力された場合
        if (is_numeric($time)) {
            $seconds = (int) $time;
            $hours = floor($seconds / 3600);
            $minutes = floor(($seconds % 3600) / 60);
            $secs = $seconds % 60;
            return sprintf('%d:%02d:%02d', $hours, $minutes, $secs);
        }

        // すでに HH:MM:SS や MM:SS 形式の場合
        if (preg_match('/^\d+:\d+$/', $time)) {
            $parts = explode(':', $time);
            if (count($parts) === 2) {
                return '0:' . $parts[0] . ':' . $parts[1];
            }
        }

        return $time;
    }

    private function getFormatSelector(string $format): string
    {
        return match ($format) {
            'mp3', 'audio' => 'bestaudio/best',
            default => 'best[ext=mp4]/best',
        };
    }

    public function getFiles(): array
    {
        $files = glob($this->storagePath . '/*');
        return array_map(function ($file) {
            return [
                'name' => basename($file),
                'size' => filesize($file),
                'path' => $file,
            ];
        }, $files ?: []);
    }

    public function deleteFile(string $filename): bool
    {
        $filepath = $this->storagePath . '/' . $filename;
        if (file_exists($filepath)) {
            return unlink($filepath);
        }
        return false;
    }
}
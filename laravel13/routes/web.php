<?php

use App\Http\Controllers\YouTubeDownloadController;
use App\Http\Controllers\MiniMaxController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/youtube', [YouTubeDownloadController::class, 'index']);
Route::post('/youtube/download', [YouTubeDownloadController::class, 'download']);

// MiniMax Routes
Route::get('/minimax', [MiniMaxController::class, 'index'])->name('minimax.index');
Route::post('/minimax/image', [MiniMaxController::class, 'generateImage'])->name('minimax.image');
Route::post('/minimax/audio', [MiniMaxController::class, 'generateAudio'])->name('minimax.audio');

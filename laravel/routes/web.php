<?php

use App\Http\Controllers\YouTubeDownloadController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/youtube', [YouTubeDownloadController::class, 'index']);
Route::post('/youtube/download', [YouTubeDownloadController::class, 'download']);
Route::get('/youtube/files', [YouTubeDownloadController::class, 'files']);
Route::delete('/youtube/files/{filename}', [YouTubeDownloadController::class, 'delete']);

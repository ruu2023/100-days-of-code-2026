/**
 * Chill Vibes - JavaScript
 * Theme toggle and player controls
 */

(function () {
  "use strict";

  // ============================================
  // Theme Management
  // ============================================
  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;

  // Check for saved theme preference or default to dark
  const savedTheme = localStorage.getItem("chill-vibes-theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  // Apply initial theme
  const initialTheme = savedTheme || (prefersDark ? "dark" : "dark");
  html.setAttribute("data-theme", initialTheme);

  // Theme toggle click handler
  themeToggle?.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("chill-vibes-theme", newTheme);
  });

  // ============================================
  // Music Player Controls
  // ============================================
  const playBtn = document.getElementById("playBtn");
  const playerCard = document.querySelector(".player-card");
  const vinyl = document.getElementById("vinyl");
  let isPlaying = false;

  // Play/Pause button handler
  playBtn?.addEventListener("click", () => {
    isPlaying = !isPlaying;

    if (isPlaying) {
      playerCard?.classList.add("playing");
      vinyl?.classList.add("playing");
    } else {
      playerCard?.classList.remove("playing");
      vinyl?.classList.remove("playing");
    }
  });

  // Progress bar click to seek (visual only)
  const progressBar = document.querySelector(".progress-bar");
  progressBar?.addEventListener("click", (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;

    const progressFill = progressBar.querySelector(".progress-fill");
    if (progressFill) {
      progressFill.style.width = `${percent}%`;
    }
  });

  // Volume slider interaction
  const volumeSlider = document.querySelector(".volume-slider");
  volumeSlider?.addEventListener("click", (e) => {
    const rect = volumeSlider.getBoundingClientRect();
    const percent = ((e.clientX - rect.left) / rect.width) * 100;

    const volumeFill = volumeSlider.querySelector(".volume-fill");
    if (volumeFill) {
      volumeFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
  });

  // ============================================
  // Playlist Track Selection
  // ============================================
  const playlistTracks = document.querySelectorAll(".playlist-track");

  playlistTracks.forEach((track) => {
    track.addEventListener("click", () => {
      // Reset all tracks
      playlistTracks.forEach((t) => (t.style.opacity = "1"));

      // Highlight selected track
      track.style.opacity = "0.7";

      // Update player info with track details
      const title = track.querySelector("h4")?.textContent;
      const artist = track.querySelector("p")?.textContent;

      if (title) {
        const trackTitle = document.querySelector(".track-title");
        if (trackTitle) trackTitle.textContent = title;
      }

      if (artist) {
        const trackArtist = document.querySelector(".track-artist");
        if (trackArtist) trackArtist.textContent = artist;
      }

      // Auto-play when track is selected
      if (!isPlaying && playBtn) {
        playBtn.click();
      }
    });
  });

  // ============================================
  // Video Card Click Handlers
  // ============================================
  const videoCards = document.querySelectorAll(".video-card");

  videoCards.forEach((card) => {
    card.addEventListener("click", () => {
      const title = card.querySelector("h4")?.textContent;
      console.log(`Playing video: ${title}`);
      // In a real app, this would open a video player
    });
  });

  // ============================================
  // Reduced Motion Support
  // ============================================
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  if (prefersReducedMotion.matches) {
    // Disable CSS animations via JS if needed
    document.documentElement.style.setProperty("--transition-fast", "0s");
    document.documentElement.style.setProperty("--transition-normal", "0s");
    document.documentElement.style.setProperty("--transition-slow", "0s");
  }

  // ============================================
  // Initialize
  // ============================================
  console.log("Chill Vibes initialized ✨");
})();

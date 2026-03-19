# Chill Vibes Web Page - Specification

## Project Overview

- **Project Name**: Chill Vibes - チルビン
- **Type**: Single-page chill/Lo-Fi music visualizer website
- **Core Functionality**: A relaxing, cozy web page featuring a music player UI, video background, and ambient animations inspired by Lo-Fi music videos and chill YouTube content
- **Target Users**: People seeking relaxation, focus music listeners, creative workers

## UI/UX Specification

### Layout Structure

- **Header**: Fixed top navigation with logo and theme toggle
- **Hero Section**: Full-viewport with video/image background and centered music player
- **Content Area**: Featured chill playlists in horizontal scroll
- **Footer**: Minimal footer with credits

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

### Visual Design

#### Color Palette

**Dark Mode (Default)**

- Background Primary: #0a0a0f (Deep night)
- Background Secondary: #12121a (Soft dark)
- Surface: rgba(255, 255, 255, 0.05) (Glass)
- Accent Primary: #e8c4a0 (Warm peach/coral)
- Accent Secondary: #8b7ec4 (Soft lavender)
- Text Primary: #f5f5f5
- Text Secondary: #a0a0a0

**Light Mode**

- Background Primary: #faf8f5 (Warm cream)
- Background Secondary: #f0ebe3 (Soft beige)
- Surface: rgba(255, 255, 255, 0.7) (Glass)
- Accent Primary: #d4a574 (Warm brown)
- Accent Secondary: #7c6ba8 (Muted purple)
- Text Primary: #2a2a2a
- Text Secondary: #666666

#### Typography

- Primary Font: "Noto Sans JP", sans-serif (from assets)
- Headings: 700 weight, tracking -0.02em
- Body: 400 weight
- Display (Logo): 300 weight, large

#### Spacing System

- Base unit: 8px
- Sections: 80px vertical padding
- Components: 24px internal padding
- Gap: 16px standard

#### Visual Effects

- **Glassmorphism**: backdrop-filter: blur(20px) with semi-transparent backgrounds
- **Glow effects**: Soft box-shadow with accent colors
- **Floating animation**: Subtle up/down motion (3s ease-in-out infinite)
- **Grain texture**: CSS noise overlay for artisanal feel
- **Vinyl record**: Rotating disc animation for music player

### Components

#### 1. Theme Toggle

- Pill-shaped toggle with sun/moon icons
- Smooth transition between modes
- Saves preference to localStorage

#### 2. Music Player (Main Feature)

- Vinyl record visualization (rotating)
- Album art display
- Track info (title, artist)
- Play/pause button with glow effect
- Progress bar with custom styling
- Volume slider
- Time display (current/total)

#### 3. Video Player (Visual Element)

- Thumbnail with play overlay
- Minimalist controls
- Picture-in-picture style frame

#### 4. Chill Cards

- Horizontal scrolling playlist items
- Glassmorphic background
- Hover lift effect
- Album art thumbnails

#### 5. Floating Particles

- Animated dots floating upward
- Varying sizes and speeds
- Low opacity for subtlety

## Functionality Specification

### Core Features

1. **Theme Switching**: Toggle between dark/light modes with smooth transitions
2. **Music Player UI**: Visual-only player with play/pause animation (no actual audio)
3. **Video Thumbnail**: Clickable video area with hover effect
4. **Playlist Scroll**: Horizontal scrollable chill track list
5. **Ambient Animations**: Floating particles, rotating vinyl, pulsing elements

### User Interactions

- Click theme toggle → smooth color transition
- Click play button → vinyl starts rotating, button state changes
- Hover on cards → subtle lift and glow
- Scroll playlist → smooth horizontal scroll with snap

### Data Handling

- Theme preference stored in localStorage
- No external API calls (static demo)

### Edge Cases

- Reduced motion preference respected
- Fallback fonts if Noto Sans JP fails to load

## Acceptance Criteria

1. ✅ Page loads with dark theme by default
2. ✅ Theme toggle switches between dark/light smoothly
3. ✅ Music player shows vinyl record that rotates when "playing"
4. ✅ Glassmorphic UI elements are visible
5. ✅ Floating particles animation runs smoothly
6. ✅ Responsive layout works on mobile (< 640px)
7. ✅ Horizontal playlist scrolls on all screen sizes
8. ✅ All animations respect prefers-reduced-motion
9. ✅ No horizontal scroll on any viewport
10. ✅ All text is readable in both themes

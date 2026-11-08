# Contributing to LiveTV

First off, thank you for considering contributing to **LiveTV**! 🎉

LiveTV is a free, open-source project dedicated to aggregating over 18,400+ public live television broadcasts across 200+ countries with an interactive web player, country M3U playlists, and real-time EPG program schedules. Community contributions keep the channel catalog fresh, accurate, and accessible to viewers worldwide.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How You Can Contribute](#how-you-can-contribute)
  - [1. Adding or Updating Channels](#1-adding-or-updating-channels)
  - [2. Reporting or Fixing Broken Streams](#2-reporting-or-fixing-broken-streams)
  - [3. Adding or Improving Translations (i18n)](#3-adding-or-improving-translations-i18n)
  - [4. Frontend & Backend Enhancements](#4-frontend--backend-enhancements)
- [Stream Submission Guidelines](#stream-submission-guidelines)
- [Development Workflow](#development-workflow)
- [Code Style & Best Practices](#code-style--best-practices)
- [Contact & Getting Help](#contact--getting-help)

---

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it to understand our expectations for a respectful, inclusive, and harassment-free community.

---

## How You Can Contribute

### 1. Adding or Updating Channels
Each country in LiveTV has a dedicated playlist file located in the `streams/` directory:
```text
streams/<country_code>.m3u
```
For example:
- `streams/us.m3u` for United States
- `streams/uk.m3u` for United Kingdom
- `streams/bd.m3u` for Bangladesh
- `streams/kr.m3u` for South Korea

To add a new channel or update an existing stream, edit the corresponding `<country_code>.m3u` file following the [Stream Submission Guidelines](#stream-submission-guidelines).

### 2. Reporting or Fixing Broken Streams
Live stream URLs often expire, rotate tokens, or change servers:
- If you find a stream that is buffering indefinitely or returning 404/403, submit an issue or a Pull Request with an updated working feed URL.
- Please verify the new stream in VLC, MPV, or in the browser using the LiveTV player before submitting.

### 3. Adding or Improving Translations (i18n)
LiveTV supports multi-language interfaces with RTL support:
- Translations are located in [public/js/i18n.js](public/js/i18n.js).
- If you speak a language that is not yet supported or noticed a translation typo, add or edit the locale dictionary in `public/js/i18n.js` and add the language option in `views/index.ejs`.

### 4. Frontend & Backend Enhancements
- **UI/UX improvements**: Accessibility (a11y), animations, keyboard navigation, or mobile layout refinements.
- **Backend features**: Fast indexing, API query improvements, caching headers, or EPG parsers.
- **Bug fixes**: Resolving edge cases in HLS player playback, audio level syncing, or fullscreen toggles.

---

## Stream Submission Guidelines

When adding or editing channels in `streams/<country_code>.m3u`, follow these rules:

1. **Free-to-Air & Public Feeds Only**:
   - Only publicly accessible, free-to-air, or official broadcaster web streams are accepted.
   - **Do NOT submit**: Pirated streams, copyrighted pay-TV/cable feeds requiring subscriptions, private IPTV restream tokens, or adult/NSFW content.

2. **Stream Formats**:
   - Prefer HTTP Live Streaming (**HLS** `.m3u8`) feeds over raw MP4 or RTMP.
   - HTTPS URLs are strongly preferred over unencrypted HTTP (as modern browsers block mixed content).
   - Ensure the stream has CORS headers enabled (`Access-Control-Allow-Origin: *`) if intended for browser playback.

3. **M3U Entry Format**:
   Follow the standard extended M3U format:
   ```m3u
   #EXTINF:-1 tvg-id="channel.id" tvg-name="Channel Name" tvg-logo="https://example.com/logo.png" group-title="Category",Channel Name (Resolution)
   https://stream-url.example.com/live/playlist.m3u8
   ```

   **Recommended Categories (`group-title`)**:
   - `News`
   - `General`
   - `Entertainment`
   - `Movies`
   - `Sports`
   - `Music`
   - `Animation`
   - `Kids`
   - `Documentary`
   - `Religious`
   - `Education`
   - `Weather`

4. **Logos**:
   - Logos should be direct HTTPS links to transparent PNG or SVG images.
   - Prefer square or 16:9 ratio images with clean backgrounds.

---

## Development Workflow

1. **Fork the Repository**:
   Click the "Fork" button on [GitHub](https://github.com/shakibzcv/live-tv).

2. **Clone your fork locally**:
   ```bash
   git clone https://github.com/<your-username>/live-tv.git
   cd live-tv
   ```

3. **Create a topic branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/stream-update-fr
   ```

4. **Install dependencies**:
   ```bash
   pnpm install
   ```

5. **Make your changes & run locally**:
   ```bash
   pnpm dev
   ```
   Test your changes at `http://localhost:3000`.

6. **Verify build & lint**:
   ```bash
   pnpm build
   pnpm lint
   ```

7. **Submit a Pull Request**:
   - Push your branch to GitHub and open a Pull Request against the `main` branch.
   - Describe what changed and why. If updating or adding streams, provide channel verification details.

---

## Code Style & Best Practices

- **TypeScript**: Use strict types where possible; avoid unnecessary `any`.
- **CSS**: Use existing CSS custom properties (variables) defined in `:root` and `[data-theme="light"]` for consistent color schemes.
- **Responsive Design**: Ensure layouts work cleanly across mobile (< 480px), tablet (480px - 1024px), and desktop.
- **Performance**: Avoid heavy client-side libraries; maintain the project's zero-bloat vanilla JavaScript approach for client-side controllers.

---

## Contact & Getting Help

If you have questions, need guidance before submitting a PR, or wish to report a stream issue:

- **Maintainer**: Shakib Khan
- **Email**: [shakibzcv@gmail.com](mailto:shakibzcv@gmail.com)
- **GitHub Issues**: [https://github.com/shakibzcv/live-tv/issues](https://github.com/shakibzcv/live-tv/issues)
- **GitHub Discussions**: [https://github.com/shakibzcv/live-tv/discussions](https://github.com/shakibzcv/live-tv/discussions)

Thank you for helping make LiveTV better for viewers around the world! 📺🌍

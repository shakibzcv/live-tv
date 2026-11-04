# LiveTV

A high-performance live TV directory, web player, and EPG server covering 200+ countries with 18,400+ stream feeds.

## Features

- **Worldwide Channels Directory**: Over 18,400+ television channels categorized by country, genre, and quality.
- **Unified Country M3U Feeds**: Each country has a single consolidated M3U playlist file in `streams/<country_code>.m3u` (e.g., `us.m3u`, `bd.m3u`, `uk.m3u`).
- **Interactive Web TV Player**: In-browser live streaming powered by HLS.js with multi-attribute search, genre filtering, volume controls, and dark-theme studio UI.
- **EPG Integration**: XMLTV and Rytec (Enigma2) guide feeds generated per country and served over clean HTTP endpoints.
- **Fast Local Catalog**: Master stream directory saved to `data/channels.json` and `data/index.m3u`.

## Getting Started

### Prerequisites

- Node.js (v18+)
- pnpm

### Installation

```bash
pnpm install
```

### Running Locally

```bash
# Development mode with hot reload
pnpm dev

# Build and production start
pnpm build
pnpm start
```

### Updating Channel Catalogs

```bash
# Consolidate and sync all country streams into data/channels.json and data/index.m3u
pnpm run update:channels
```

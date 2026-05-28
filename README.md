# Color Spectrum Analyzer

A Vue 3 web application that extracts and analyzes dominant colors from uploaded images using K-Means++ clustering.

## Features

- Upload an image and automatically extract its dominant colors
- View colors grouped by color family (red, green, blue, etc.)
- Filter palette by color family
- Sort colors by percentage
- Interactive color picker tool on the loaded image
- Export palette as JSON or PNG

## Tech Stack

- **Vue 3** (Composition API)
- **Vite 5** — dev server and build tool

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
```

Output is written to `dist/`.

### Preview Build

```bash
npm run preview
```

## Project Structure

```
src/
  App.vue                  # Root component, global state
  main.js                  # App entry point
  style.css                # Global styles
  components/
    ColorCard.vue          # Single color swatch card
    ColorPickerPanel.vue   # Eye-dropper / color picker overlay
    FamilyChart.vue        # Color family distribution chart
    ImageUploader.vue      # Drag-and-drop image upload
  utils/
    colorConverter.js      # RGB ↔ HSL ↔ HEX conversions
    colorExtractor.js      # Canvas sampling + K-Means++ clustering
    colorFamily.js         # Color family classification
    exportUtils.js         # JSON / PNG export helpers
```

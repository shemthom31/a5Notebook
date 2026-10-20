# A5 Notebooks

A beautifully crafted digital notebook app with a physical bookshelf interface, built with React 19 and TypeScript.

> Write anywhere. Keep everything. Export to PDF.

---

## Overview

Demo Version

A5 Notebooks simulates the experience of a personal library. Notebooks live on a bookshelf as color-coded spines. Open one and you're greeted with a ruled, A5-proportioned page — distraction-free writing with the warmth of paper.

All notes persist locally in the browser. No accounts, no cloud, no friction.

---

## Features

- **Bookshelf Library** — Notebooks displayed as physical spines with staggered heights and 16 spine colors
- **Ruled Page Editor** — Contenteditable writing surface with authentic ruled-paper styling
- **Ordered & Unordered Lists** — One-click formatting controls inside each page
- **PDF Export** — Export any page as a properly-formatted A5 PDF via `html2pdf.js`
- **Page Navigation** — Flip between pages with smooth spring-based page-turn animations
- **Auto-Save** — Everything persists automatically via `localStorage` — no save button needed
- **Responsive Design** — Works on desktop, tablet, and mobile with a collapsible sidebar drawer

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework & type safety |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Utility-first styling |
| Motion (Framer Motion) | Spring animations & page transitions |
| html2pdf.js | Client-side PDF export |
| Lucide React | Icon library |
| UUID | Unique notebook/page IDs |

---

## Getting Started

### Prerequisites

- Node.js 18 or higher

### Install & Run

```bash
# Clone the repo
git clone https://github.com/shemthom31/a5notebooks.git
cd a5notebooks

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app runs at `http://localhost:3000`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── components/
│   ├── Bookshelf.tsx      # Sidebar library with notebook spines & create modal
│   └── NotebookView.tsx   # Page editor with ruled paper, navigation, PDF export
├── hooks/
│   └── useStore.ts        # State management — notebooks & pages backed by localStorage
├── lib/
│   └── utils.ts           # cn() Tailwind class utility
├── types.ts               # Notebook and Page TypeScript interfaces
├── App.tsx                # Root layout — nav, sidebar, main stage
├── index.css              # Global styles, fonts, scrollbar, list formatting
└── main.tsx               # React entry point
```

---

## Data Model

All data lives in `localStorage` under the key `a5_notebooks_store`.

```ts
interface Notebook {
  id: string;
  title: string;
  color: string;        // Tailwind bg class for the spine
  pages: Page[];
  createdAt: number;
  lastOpenedAt: number;
}

interface Page {
  id: string;
  content: string;      // Raw HTML from contentEditable
  createdAt: number;
  lastEditedAt: number;
}
```

---

## License

MIT — feel free to fork, remix, and build on top of it.

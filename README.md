# House of Shakya — Railing Studio

An architectural railing studio catalogue, price calculator, and quotation web application for House of Shakya (Imadole, Mahalaxmi, Nepal).

## Features

- **Architectural Railing Catalogue**: Curated selection of steel, glass, cable, wood, and bespoke railing systems with specifications and high-resolution imagery.
- **Interactive Price Calculator**: Instant area (`sq.ft.`) × quantity × rate estimation with animated visual breakdown.
- **WhatsApp Integration**: Generates structured project quotation requirements sent directly to the House of Shakya studio team.
- **Local Admin Dashboard**: Manage railing products, track and update customer quotation statuses, and export data to CSV.

## Tech Stack

- **Framework**: React 19 + Vite 8
- **Routing**: TanStack Router / TanStack Start
- **Styling**: Tailwind CSS v4 (OKLCH design system)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: React Context with client-side state

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or bun

### Installation

```sh
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

## Project Structure

```
├── public/               # Static assets & railing imagery
├── src/
│   ├── components/       # UI components, layout, and sections
│   ├── config/           # Central studio settings & configuration
│   ├── data/             # Product catalog specifications
│   ├── hooks/            # Studio context and custom React hooks
│   ├── routes/           # File-based application routes
│   ├── utils/            # Calculation, currency, CSV, and WhatsApp helpers
│   └── styles.css        # Tailwind CSS design system tokens
```

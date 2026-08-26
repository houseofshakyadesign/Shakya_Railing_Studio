# Metal Work Nepal

An architectural metalwork, railing catalogue, price calculator, and quotation web application for Metal Work Nepal (Imadole, Mahalaxmi, Nepal).

## Features

- **Architectural Catalogue**: Curated selection of steel, glass, cable, wood, and bespoke railing systems with specifications and high-resolution imagery. Expandable to future architectural metalwork systems.
- **Interactive Boundary Railing Calculator**: Instant area (`sq.ft.`), estimated panels, and rate estimation (with 13% VAT calculated into total).
- **WhatsApp Integration**: Generates structured project quotation requirements sent directly to the Metal Work Nepal engineering team.
- **Admin Dashboard**: Manage products, direct image uploads, review enquiries, and export data to CSV.

## Tech Stack

- **Frontend**: React 19 + Vite 8
- **Backend**: Node.js + Express REST API
- **Database**: MySQL (XAMPP / MariaDB / Cloud MySQL)
- **Routing**: TanStack Router / TanStack Start
- **Styling**: Tailwind CSS v4 (OKLCH design system)
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- MySQL / XAMPP Apache & MySQL

### Installation & Running

```sh
# Install dependencies
npm install

# Run both backend and frontend concurrently
npm run dev:all

# Or run frontend only
npm run dev

# Or run backend only
npm run server
```

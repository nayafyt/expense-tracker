# Expense Tracker

A lightweight personal expense tracker built with vanilla HTML, CSS, and JavaScript. Tracks monthly spending by category, calculates running totals, and exports data to CSV.

## Features

- **Monthly salary & expense tracking** — set a salary per month and log expenses against it
- **Category tagging** — pre-defined categories (food, coffee, clothes, car utilities, revolut transfer, work) plus custom categories
- **Category breakdown** — visual progress bars showing spending per category
- **Running totals** — each expense shows cumulative spending; remaining balance highlights red when negative
- **CSV export** — download manually or auto-save to disk on every change
- **Month selector** — switch between months with separate data for each
- **Local storage** — all data persists in the browser's localStorage

## Tech Stack

- HTML / CSS / vanilla JavaScript (no frameworks)
- Node.js server for static file serving and CSV auto-save

## Getting Started

**Prerequisites:** Node.js

```bash
npm start
```

Open `http://localhost:3000` in your browser.

## Project Structure

```
├── index.html       # UI
├── app.js           # Application logic
├── style.css        # Styling
├── server.js        # Node.js server (port 3000)
├── package.json
└── expenses_*.csv   # Auto-saved CSV files
```

## CSV Format

Exported CSVs include a line-by-line expense list with running totals, a category summary section, and overall totals (salary, total expenses, remaining balance).

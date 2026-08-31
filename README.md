# NexusCart — Precision Hardware Store

A full-stack e-commerce storefront built with React, TypeScript, Tailwind CSS, Express, and PostgreSQL. Supports email/password accounts as well as Google Sign-In via Firebase Authentication.

## Features
- Product catalog with categories, filters, search, and sorting
- Cart, wishlist, checkout, and order history
- Email/password authentication and Google Sign-In (Firebase Auth)
- Admin dashboard for managing products and orders
- Responsive layout for phones, tablets, and desktops

## Prerequisites
- Node.js 18+
- A PostgreSQL database
- A Firebase project with Google Sign-In enabled (for Google login)

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your values:
   ```
   cp .env.example .env
   ```
   - `DATABASE_URL`: your PostgreSQL connection string
   - `JWT_SECRET`: a long random secret used to sign session tokens
   - `VITE_FIREBASE_*`: your Firebase web app config (Firebase Console → Project Settings → General → Your apps). Enable the **Google** sign-in provider under Authentication → Sign-in method, and add your dev/production domains under Authentication → Settings → Authorized domains.

3. Run the app in development:
   ```
   npm run dev
   ```

4. Build and run for production:
   ```
   npm run build
   npm start
   ```

## Project Structure
- `src/` — React frontend (components, contexts, services)
- `server/` — Express API (routes, database access, middleware)
- `server/db/schema.sql` — PostgreSQL schema

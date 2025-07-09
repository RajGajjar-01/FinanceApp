# 🚀 Vite + Tailwind CSS + shadcn/ui Setup Guide

A complete guide to setting up a modern React development environment with Vite, Tailwind CSS, and shadcn/ui components.

## Prerequisites

- Node.js v18+ (recommended)
- npm package manager
- Basic knowledge of React and JavaScript

---

## Step 1: Create Vite App

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
```

---

## Step 2: Install and Configure Tailwind CSS

### Install Tailwind Dependencies

```bash
npm install -D tailwindcss @tailwindcss/vite
```

### Update vite.config.js

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

### Configure CSS

Replace content in `src/index.css`:

```css
@import "tailwindcss";
```

---

## Step 3: Setup Path Aliases

### Install Node Types

```bash
npm install -D @types/node
```

### Create jsconfig.json

Create `jsconfig.json` in the root directory:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Update vite.config.js with Path Resolution

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## Step 4: Initialize shadcn/ui

```bash
npx shadcn@latest init
```

### Recommended Configuration

```
✔ Would you like to use TypeScript? … no
✔ Which style would you like to use? › New York
✔ Which color would you like to use as base color? › Zinc
✔ Where is your global CSS file? … src/index.css
✔ Would you like to use CSS variables for colors? … yes
✔ Configure the import alias for components? … @/components
✔ Configure the import alias for utils? … @/lib/utils
```

---

## Step 5: Setup Poppins Font

### Update index.html

Add to the `<head>` section:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Poppins Font -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Configure Font in Tailwind

Update `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

---

## Step 6: Test Your Setup

### Start Development Server

```bash
npm run dev
```

### Test with Basic Components

Update `src/App.jsx`:

```jsx
function App() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-lg p-8 max-w-md w-full text-center border">
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Setup Complete! 🎉
        </h1>
        <p className="text-muted-foreground mb-6">
          Vite + Tailwind + shadcn/ui is ready
        </p>
        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  )
}

export default App
```

### Add shadcn/ui Components

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

---

## Final Project Structure

```
my-app/
├── src/
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   └── utils.js         # utilities
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── components.json          # shadcn/ui config
├── index.html
├── jsconfig.json
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## Useful Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build

# Add shadcn/ui components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu

# List all available components
npx shadcn@latest add
```

## Pro Tips 💡

- **Clean Imports**: Use `@/` prefix for imports: `import { Button } from "@/components/ui/button"`
- **Component Customization**: Edit shadcn/ui components in `src/components/ui/` to customize styles
- **VS Code Extension**: Install Tailwind CSS IntelliSense for better autocomplete
- **Font Applied**: Poppins is now your default font - all text uses it automatically
- **Dark Mode Ready**: Your setup supports dark mode with `class` strategy
- **CSS Variables**: Use shadcn/ui color variables like `bg-primary`, `text-foreground` for consistent theming
- **Path Aliases**: Import from anywhere with `@/components`, `@/lib`, etc.
- **Hot Reload**: Changes to components auto-refresh in browserkv
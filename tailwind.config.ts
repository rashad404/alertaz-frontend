import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors - Updated to match logo
        brand: {
          orange: "#FF6021",  // Primary brand color from logo
          "orange-dark": "#E54500",  // Darker for hover states
          "orange-light": "#FF7A3D",  // Lighter for accents
          "orange-text": "#052320",  // Dark text from logo
          green: "#3ADB92",  // Keep green only for success states
          "green-dark": "#2DA870",
          purple: "#D91CD9",
          blue: "#0099FF",
        },
        // Grayscale
        grayscale: {
          900: "#121127",
          "900-56": "rgba(18, 17, 39, 0.56)",
          "900-40": "rgba(18, 17, 39, 0.40)",
          "900-12": "rgba(18, 17, 39, 0.12)",
        },
        // Text colors
        text: {
          "gray-10": "#383B46",
          "gray-05": "#888990",
          "gray-02": "#D7D8DA",
        },
        // Background colors
        bg: {
          "grey-f9": "#F9F9F9",
          "light-purple": "#EFEFFD",
          "light-green": "#EFFFEB",
          "light-orange": "#FFECC8",
          "light-blue": "#DAE8FF",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        "DM_Sans": ["var(--font-dm-sans)", "system-ui", "sans-serif"],
      },
      spacing: {
        13: "3.25rem",
        15: "3.75rem",
        17: "4.25rem",
        46: "11.5rem",
        54: "13.5rem",
        57: "14.25rem",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
} satisfies Config;
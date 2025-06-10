import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Cairo', 'sans-serif'],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
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
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
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
          light: "hsl(var(--accent-light))",
          dark: "hsl(var(--accent-dark))",
          bg: "hsl(var(--accent-bg))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        // Earth-tone color palettes
        "black-olive": "hsl(69, 9%, 25%)", // #3f4238
        "reseda-green": "hsl(77, 9%, 43%)", // #6b705c
        "sage": "hsl(60, 13%, 65%)", // #a5a58d
        "champagne-pink": "hsl(45, 30%, 89%)", // #ffe8d6
        "desert-sand": "hsl(37, 30%, 82%)", // #ddbea9
        "buff": "hsl(32, 24%, 64%)", // #cb997e
        "beaver": "hsl(25, 23%, 58%)", // #b98b73
        "ash-gray": "hsl(60, 6%, 72%)", // #b7b7a4
        "dun": "hsl(47, 17%, 72%)", // #d4c7b0
        
        // Legacy color aliases for compatibility
        "accent-red": {
          DEFAULT: "hsl(77, 9%, 43%)", // reseda-green
          dark: "hsl(69, 9%, 25%)", // black-olive
        },
        "primary-600": "hsl(77, 9%, 43%)", // reseda-green
        "primary-50": "hsl(45, 30%, 89%)", // champagne-pink
        "green-600": "hsl(77, 9%, 43%)", // reseda-green
        "green-50": "hsl(45, 30%, 89%)", // champagne-pink
        
        // New earth-tone variants for better organization
        "earth": {
          olive: "hsl(69, 9%, 25%)", // #3f4238
          green: "hsl(77, 9%, 43%)", // #6b705c
          sage: "hsl(60, 13%, 65%)", // #a5a58d
          pink: "hsl(45, 30%, 89%)", // #ffe8d6
          sand: "hsl(37, 30%, 82%)", // #ddbea9
          buff: "hsl(32, 24%, 64%)", // #cb997e
          beaver: "hsl(25, 23%, 58%)", // #b98b73
          gray: "hsl(60, 6%, 72%)", // #b7b7a4
          dun: "hsl(47, 17%, 72%)", // #d4c7b0
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

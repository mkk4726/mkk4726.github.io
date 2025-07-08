import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      typography: {
        DEFAULT: {
          css: {
            p: { marginTop: '1.2em', marginBottom: '1.2em' },
            ul: { marginTop: '1.2em', marginBottom: '1.2em' },
            ol: { marginTop: '1.2em', marginBottom: '1.2em' },
            h1: {
              fontSize: '2.25rem',
              fontWeight: '800',
              marginTop: '2rem',
              marginBottom: '1rem',
              color: '#111827',
            },
            h2: {
              fontSize: '1.875rem',
              fontWeight: '700',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
              color: '#111827',
            },
            h3: {
              fontSize: '1.5rem',
              fontWeight: '600',
              marginTop: '1.25rem',
              marginBottom: '0.5rem',
              color: '#111827',
            },
            blockquote: {
              borderLeftWidth: '4px',
              borderLeftColor: '#3b82f6',
              backgroundColor: '#eff6ff',
              paddingLeft: '1.5rem',
              paddingTop: '0.5rem',
              paddingBottom: '0.5rem',
              fontStyle: 'normal',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            hr: {
              borderColor: '#d1d5db',
              marginTop: '2rem',
              marginBottom: '2rem',
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config; 
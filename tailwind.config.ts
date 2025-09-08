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
            ul: { 
              marginTop: '1.2em', 
              marginBottom: '1.2em',
              listStyleType: 'disc',
              paddingLeft: '1.5rem',
              color: '#111827',
            },
            ol: { 
              marginTop: '1.2em', 
              marginBottom: '1.2em',
              listStyleType: 'decimal',
              paddingLeft: '1.5rem',
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
            table: {
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
              overflowX: 'auto',
              display: 'table',
            },
            'table thead': {
              backgroundColor: '#f8fafc',
            },
            'table th': {
              padding: '0.75rem 1rem',
              textAlign: 'left',
              fontWeight: '600',
              color: '#374151',
              border: '1px solid #e5e7eb',
              backgroundColor: '#f9fafb',
            },
            'table td': {
              padding: '0.75rem 1rem',
              border: '1px solid #e5e7eb',
              color: '#374151',
            },
            'table tr:nth-child(even)': {
              backgroundColor: '#f8fafc',
            },
            'table tr:hover': {
              backgroundColor: '#f1f5f9',
            },
            'br': {
              display: 'block',
              margin: '0.5rem 0',
              content: '""',
            },
            'strong': {
              fontWeight: '700',
              color: '#111827',
            },
            'em': {
              fontStyle: 'italic',
              color: '#374151',
            },
            'code': {
              backgroundColor: '#f3f4f6',
              color: '#1f2937',
              padding: '0.125rem 0.25rem',
              borderRadius: '0.25rem',
              fontFamily: 'Courier New, monospace',
              fontSize: '0.875rem',
            },
            'pre': {
              backgroundColor: '#1f2937',
              color: '#f9fafb',
              padding: '1rem',
              borderRadius: '0.5rem',
              overflowX: 'auto',
              marginTop: '1.5rem',
              marginBottom: '1.5rem',
            },
            'pre code': {
              backgroundColor: 'transparent',
              color: 'inherit',
              padding: '0',
            },
            'li': {
              marginTop: '0.25rem',
              marginBottom: '0.25rem',
              color: '#374151',
            },
            'li::marker': {
              color: '#374151',
              fontWeight: '500',
            },
            'ul > li::marker': {
              color: '#374151',
            },
            'ol > li::marker': {
              color: '#374151',
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config; 
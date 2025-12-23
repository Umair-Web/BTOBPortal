import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: "#788F35",
          light: "#A9BF4B",
          dark: "#4E6429",
        },
        brandYellow: "#CCBE1A",
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
      
    },
  },
  plugins: [],
};
export default config;


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
          DEFAULT: "#5B9BD5",
          light: "#7DB4E6",
          dark: "#3A7BC8",
        },
      },
      borderRadius: {
        DEFAULT: "0",
      },
    },
  },
  plugins: [],
};
export default config;


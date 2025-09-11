import { DM_Sans, Lora, IBM_Plex_Mono } from "next/font/google";

// Sans-serif font - DM Sans
export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Serif font - Lora
export const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Monospace font - IBM Plex Mono
export const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Export all fonts for easy use in layout
export const fonts = {
  sans: dmSans,
  serif: lora,
  mono: ibmPlexMono,
};

// Helper to get all font variables as a string
export const fontVariables = `${dmSans.variable} ${lora.variable} ${ibmPlexMono.variable}`;

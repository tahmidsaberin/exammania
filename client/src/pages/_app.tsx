import type { AppProps } from "next/app";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/theme";
import "@/lib/i18n";
import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Component {...pageProps} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              background: "var(--toast-bg, #fff)",
              color: "var(--toast-color, #111)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

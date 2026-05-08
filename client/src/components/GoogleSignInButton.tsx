"use client";

import React, { useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          renderButton: (element: HTMLElement, config: object) => void;
          prompt: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess?: () => void;
}

export default function GoogleSignInButton({ onSuccess }: GoogleSignInButtonProps) {
  const { signIn } = useAuth();
  const { t } = useTranslation();
  const btnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: { credential: string }) => {
          try {
            await signIn(response.credential);
            toast.success("Signed in successfully!");
            onSuccess?.();
          } catch {
            toast.error("Sign-in failed. Please try again.");
          }
        },
      });

      if (btnRef.current) {
        window.google?.accounts.id.renderButton(btnRef.current, {
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 300,
        });
      }
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [signIn, onSuccess]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div ref={btnRef} aria-label={t("nav.signIn")} />
    </div>
  );
}

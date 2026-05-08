"use client";

import React, { useEffect, useState, useCallback } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import clsx from "clsx";

interface TimerProps {
  totalSeconds: number;
  onExpire: () => void;
  paused?: boolean;
}

export default function Timer({ totalSeconds, onExpire, paused = false }: TimerProps) {
  const { t } = useTranslation();
  const [remaining, setRemaining] = useState(totalSeconds);

  const handleExpire = useCallback(() => {
    onExpire();
  }, [onExpire]);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      handleExpire();
      return;
    }

    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          handleExpire();
          return 0;
        }
        return r - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [paused, remaining, handleExpire]);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  const isUrgent = remaining <= 300; // last 5 minutes

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      className={clsx(
        "flex items-center gap-2 rounded-xl px-4 py-2 font-mono text-lg font-bold tabular-nums",
        isUrgent
          ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse"
          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      )}
      role="timer"
      aria-live="polite"
      aria-label={`${t("exam.timeRemaining")}: ${hours > 0 ? `${pad(hours)}:` : ""}${pad(minutes)}:${pad(seconds)}`}
    >
      <ClockIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
      <span>
        {hours > 0 && `${pad(hours)}:`}{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  );
}

export type ColorKey =
  | "emerald"
  | "violet"
  | "blue"
  | "rose"
  | "amber"
  | "teal"
  | "slate"
  | "indigo"
  | "fuchsia"
  | "lime";

export const COLOR_OPTIONS: Array<{ value: ColorKey; label: string; gradient: string }> = [
  { value: "emerald", label: "Emerald", gradient: "from-emerald-600 via-lime-600 to-emerald-700" },
  { value: "violet", label: "Violet", gradient: "from-violet-600 via-fuchsia-600 to-purple-700" },
  { value: "blue", label: "Blue", gradient: "from-sky-600 via-indigo-600 to-blue-700" },
  { value: "rose", label: "Rose", gradient: "from-rose-600 via-fuchsia-600 to-pink-700" },
  { value: "amber", label: "Amber", gradient: "from-amber-600 via-orange-600 to-amber-700" },
  { value: "teal", label: "Teal", gradient: "from-teal-600 via-cyan-600 to-sky-700" },
  { value: "slate", label: "Slate", gradient: "from-slate-600 via-slate-700 to-slate-800" },
  { value: "indigo", label: "Indigo", gradient: "from-indigo-600 via-blue-700 to-indigo-800" },
  { value: "fuchsia", label: "Fuchsia", gradient: "from-fuchsia-600 via-pink-600 to-purple-700" },
  { value: "lime", label: "Lime", gradient: "from-lime-600 via-emerald-600 to-green-700" },
];

export const COLOR_GRADIENTS: Record<ColorKey, string> = Object.fromEntries(
  COLOR_OPTIONS.map(({ value, gradient }) => [value, gradient])
) as Record<ColorKey, string>;

export const COLOR_DISPLAY: Record<ColorKey, string> = Object.fromEntries(
  COLOR_OPTIONS.map(({ value, label }) => [value, label])
) as Record<ColorKey, string>;

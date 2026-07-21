@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
@import "tailwindcss";

html {
  font-size: 130% !important;
}

@font-face {
  font-family: "Nunito Sans";
  src: url("/fonts/NunitoSans-Light.ttf") format("truetype");
  font-weight: 300;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Nunito Sans";
  src: url("/fonts/NunitoSans-Regular.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Nunito Sans";
  src: url("/fonts/NunitoSans-SemiBold.ttf") format("truetype");
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Nunito Sans";
  src: url("/fonts/NunitoSans-Bold.ttf") format("truetype");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Nunito Sans";
  src: url("/fonts/NunitoSans-ExtraBold.ttf") format("truetype");
  font-weight: 800;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Nunito Sans";
  src: url("/fonts/NunitoSans-Black.ttf") format("truetype");
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Nunito Sans";
  src: url("/fonts/NunitoSans-Italic.ttf") format("truetype");
  font-weight: 400;
  font-style: italic;
  font-display: swap;
}

@theme {
  --font-sans: "Nunito Sans", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}

/* ==========================================================================
   THEME SWITCHER OVERRIDES (Preserving professional structure)
   ========================================================================== */

/* Theme Dark overrides */
.theme-dark {
  background-color: #0f172a !important; /* Slate 900 */
  color: #f1f5f9 !important;
}

.theme-dark .min-h-screen {
  background-color: #0f172a !important;
}

.theme-dark header,
.theme-dark .bg-white {
  background-color: #1e293b !important; /* Slate 800 */
  border-color: #334155 !important;
  color: #f1f5f9 !important;
}

.theme-dark .text-slate-800,
.theme-dark .text-slate-700,
.theme-dark .text-slate-900,
.theme-dark .text-slate-600 {
  color: #e2e8f0 !important;
}

.theme-dark .text-slate-500,
.theme-dark .text-slate-400 {
  color: #94a3b8 !important;
}

.theme-dark .bg-slate-50,
.theme-dark .bg-slate-100 {
  background-color: #0f172a !important; /* Slate 900 */
  border-color: #334155 !important;
}

.theme-dark .border-slate-200,
.theme-dark .border-slate-150,
.theme-dark .border-slate-100 {
  border-color: #334155 !important;
}

.theme-dark input,
.theme-dark select,
.theme-dark textarea {
  background-color: #0f172a !important;
  border-color: #475569 !important;
  color: #ffffff !important;
}

.theme-dark .bg-blue-50 {
  background-color: rgba(59, 130, 246, 0.1) !important;
  color: #93c5fd !important;
  border-color: rgba(59, 130, 246, 0.2) !important;
}

.theme-dark .text-blue-700,
.theme-dark .text-blue-600 {
  color: #3b82f6 !important;
}

.theme-dark .text-blue-900 {
  color: #93c5fd !important;
}

.theme-dark .bg-blue-700 {
  background-color: #3b82f6 !important;
}

.theme-dark .bg-blue-600 {
  background-color: #2563eb !important;
}

.theme-dark .bg-emerald-50,
.theme-dark .bg-emerald-50\/40 {
  background-color: rgba(16, 185, 129, 0.15) !important;
  color: #34d399 !important;
  border-color: rgba(16, 185, 129, 0.25) !important;
}

.theme-dark .text-emerald-700,
.theme-dark .text-emerald-600 {
  color: #34d399 !important;
}

.theme-dark .bg-amber-50,
.theme-dark .bg-amber-50\/40 {
  background-color: rgba(245, 158, 11, 0.15) !important;
  color: #fbbf24 !important;
  border-color: rgba(245, 158, 11, 0.25) !important;
}

.theme-dark .text-amber-700,
.theme-dark .text-amber-600 {
  color: #fbbf24 !important;
}

.theme-dark .bg-rose-50,
.theme-dark .bg-rose-50\/40,
.theme-dark .bg-red-50,
.theme-dark .bg-red-50\/40 {
  background-color: rgba(239, 68, 68, 0.15) !important;
  color: #f87171 !important;
  border-color: rgba(239, 68, 68, 0.25) !important;
}

.theme-dark .text-rose-700,
.theme-dark .text-rose-600,
.theme-dark .text-red-700,
.theme-dark .text-red-600 {
  color: #f87171 !important;
}

.theme-dark .bg-indigo-50 {
  background-color: rgba(99, 102, 241, 0.1) !important;
  color: #a5b4fc !important;
  border-color: rgba(99, 102, 241, 0.2) !important;
}

.theme-dark .text-indigo-700 {
  color: #a5b4fc !important;
}

.theme-dark .shadow-sm {
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.5) !important;
}

.theme-dark .text-slate-200 {
  color: #cbd5e1 !important;
}

/* Theme Exed overrides (Navy, Burgundy Red & Gold Accent) */
.theme-exed {
  background-color: #f7f5f0 !important; /* Warm Alabaster */
}

.theme-exed header {
  background-color: #1a2b3c !important; /* Corporate Navy */
  color: #ffffff !important;
  border-bottom: 2px solid #b89640 !important; /* Gold */
}

.theme-exed header .text-slate-800 {
  color: #ffffff !important;
}

.theme-exed header .bg-slate-50 .text-slate-800,
.theme-exed header .bg-slate-50 span {
  color: #1e293b !important;
}

.theme-exed header .text-slate-400 {
  color: #d1d5db !important;
}

.theme-exed .bg-blue-700 {
  background-color: #7b1a2c !important; /* Exed Burgundy Red */
}

.theme-exed .text-blue-700 {
  color: #7b1a2c !important;
}

.theme-exed .text-blue-600 {
  color: #7b1a2c !important;
}

.theme-exed .bg-blue-600 {
  background-color: #7b1a2c !important;
}

.theme-exed .bg-blue-50 {
  background-color: #fbf5f6 !important;
  border-color: #edd1d6 !important;
  color: #7b1a2c !important;
}

.theme-exed .bg-indigo-50 {
  background-color: #fdfaf2 !important; /* Gold Tint */
  border-color: #eddcb4 !important;
  color: #b89640 !important;
}

.theme-exed .text-indigo-700 {
  color: #b89640 !important;
}

.theme-exed .shadow-blue-600\/10 {
  box-shadow: 0 4px 6px -1px rgba(123, 26, 44, 0.15) !important;
}

.theme-exed .bg-slate-900 {
  background-color: #111e2e !important; /* Solid Navy Dark */
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.2s ease-in-out 0s 2;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}



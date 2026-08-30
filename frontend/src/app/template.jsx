"use client";

// Next.js remounts `template.jsx` on every navigation (unlike layout.jsx,
// which persists), so the CSS animation below replays each time the route
// changes — giving every page-to-page navigation a smooth fade + rise
// without any extra animation library.
export default function Template({ children }) {
  return <div className="animate-page-enter">{children}</div>;
}

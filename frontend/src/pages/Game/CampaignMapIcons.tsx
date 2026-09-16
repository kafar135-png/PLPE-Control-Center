import type { CSSProperties } from "react";
export type CampaignIconKind = "tower" | "shield" | "lock" | "pack" | "flag" | "book" | "sword" | "chevron" | "close" | "spark";
export default function CampaignMapIcon({ kind, className = "", style }: { kind: CampaignIconKind; className?: string; style?: CSSProperties }) {
  const common = { viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const, className, style };
  return <svg {...common}>
    {kind === "tower" && <><path d="M7 29V12L4 9V3h5v4h5V3h4v4h5V3h5v6l-3 3v17H7Z" fill="currentColor" fillOpacity=".18"/><path d="M4 29h24M7 13h18M14 29v-8a3 3 0 0 1 6 0v8M11 15v3M22 15v3"/></>}
    {kind === "shield" && <><path d="m16 3 11 4v9c0 6-6 11-11 14C11 27 5 22 5 16V7l11-4Z" fill="currentColor" fillOpacity=".18"/><path d="m10 15 4 4 8-9"/></>}
    {kind === "lock" && <><rect x="7" y="14" width="18" height="15" rx="3"/><path d="M11 14V9a5 5 0 0 1 10 0v5M16 20v4"/></>}
    {kind === "pack" && <><rect x="6" y="9" width="20" height="21" rx="6"/><path d="M12 9V6a4 4 0 0 1 8 0v3M6 16h20M11 23h10M11 21v5M21 21v5"/></>}
    {kind === "flag" && <><path d="M7 29V3m0 2c6-5 12 5 20 0v13c-8 5-14-5-20 0" fill="currentColor" fillOpacity=".16"/></>}
    {kind === "book" && <><path d="M16 29C12 24 7 28 3 24V4c5 4 9 0 13 4 4-4 8 0 13-4v20c-4 4-9 0-13 5ZM16 8v21M7 11h5M7 16h5M20 11h5M20 16h5"/></>}
    {kind === "sword" && <><path d="m21 3 8 0v8L12 28l-8-8L21 3Zm-13 20-5 6m1-13 12 12M26 6 10 22"/></>}
    {kind === "chevron" && <path d="m12 5 11 11-11 11"/>}
    {kind === "close" && <path d="m7 7 18 18M25 7 7 25"/>}
    {kind === "spark" && <path d="m16 2 4 10 10 4-10 4-4 10-4-10L2 16l10-4L16 2Z" fill="currentColor" fillOpacity=".16"/>}
  </svg>;
}

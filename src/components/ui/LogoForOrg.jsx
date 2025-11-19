// src/components/ui/LogoForOrg.jsx
import React, { useEffect, useState } from "react";

// LogoForOrg
// Props:
// - activeOrganization: string (e.g. 'YPP', 'GD')
// - size: number (px) default 32
// - overrides: object mapping ORG -> relative path (optional)
// Behavior: attempts several candidate URLs (built from VITE_API_URL) then falls back
// to a local `/logo-default.png` and finally to an initials bubble.
export default function LogoForOrg({
  activeOrganization,
  size = 64,
  overrides = {},
}) {
  const API_BASE = import.meta.env.VITE_API_URL.replace(/\/+api\/?$/i, "");
  const org = (activeOrganization || "").toLowerCase();
  const ORG_KEY = (activeOrganization || "").toUpperCase();

  // build candidate relative paths; allow override for specific orgs
  const relCandidates = [];
  if (overrides && overrides[ORG_KEY]) relCandidates.push(overrides[ORG_KEY]);
  relCandidates.push(`/uploads/logos/${org}.png`);
  relCandidates.push(`/uploads/logos/ypp/${org}.png`);
  relCandidates.push(`/uploads/logos/ypp/gd/${org}.png`);

  const candidates = relCandidates.map((p) => `${API_BASE}${p}`);

  const [index, setIndex] = useState(0);
  const [src, setSrc] = useState(candidates[0] || "/logo-default.png");
  const [showInitials, setShowInitials] = useState(false);

  useEffect(() => {
    const next = relCandidates.map((p) => `${API_BASE}${p}`);
    setIndex(0);
    setShowInitials(false);
    setSrc(next[0] || "/logo-default.png");
    // include API_BASE and org in deps to keep values in sync
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrganization, API_BASE]);

  const handleError = () => {
    const next = index + 1;
    if (next < candidates.length) {
      setIndex(next);
      setSrc(candidates[next]);
    } else if (src !== "/logo-default.png") {
      // try local default next
      setSrc("/logo-default.png");
    } else {
      // finally show initials
      setShowInitials(true);
    }
  };

  // compute initials for fallback (take first letters of words or first 1-2 chars)
  const getInitials = () => {
    if (!activeOrganization) return "?";
    const parts = activeOrganization.split(/[^A-Za-z0-9]+/).filter(Boolean);
    if (parts.length === 0) return activeOrganization.slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (showInitials) {
    const initials = getInitials();
    return (
      <div
        aria-hidden
        title={activeOrganization || "Org"}
        style={{ width: size, height: size }}
        className="flex items-center justify-center bg-base-300 text-base-700 font-semibold rounded-full"
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={`${activeOrganization || "Org"} logo`}
      width={size}
      height={size}
      className="object-contain rounded"
      onError={handleError}
      style={{ width: size, height: size }}
    />
  );
}

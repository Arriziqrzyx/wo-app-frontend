import React, { useEffect } from "react";

export default function FullscreenImageModal({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt || "Gambar"}
          className="max-w-full max-h-[90vh] rounded shadow-lg"
        />
        <div className="flex justify-center mt-3">
          <button
            onClick={onClose}
            className="btn btn-sm btn-ghost text-white bg-black/30"
            type="button"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function AttachmentsGallery({
  files = [],
  title,
  // eslint-disable-next-line no-unused-vars
  baseUrl,
  className = "",
}) {
  if (!files || files.length === 0) return null;

  // Always take base URL from environment for production.
  const envApi = import.meta.env.VITE_API_URL;
  if (!envApi) {
    console.error(
      "AttachmentsGallery: VITE_API_URL is not defined in environment variables."
    );
    return null;
  }

  // strip trailing /api if developer put the API root in VITE_API_URL
  const resolvedBase = envApi.replace(/\/api\/?$/i, "");

  const joinUrl = (b, p) =>
    `${b.replace(/\/$/, "")}/${String(p).replace(/^\//, "")}`;

  return (
    <div className={`mb-6 ${className}`}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <div className="flex flex-wrap gap-3">
        {files.map((file, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className="w-28 h-28 bg-base-200 rounded-lg overflow-hidden"
          >
            {/\.(jpg|jpeg|png|gif)$/i.test(file) ? (
              <img
                src={joinUrl(resolvedBase, file)}
                alt={`${title || "Lampiran"} ${idx + 1}`}
                className="object-cover w-full h-full"
              />
            ) : (
              <a
                href={joinUrl(resolvedBase, file)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center w-full h-full text-center text-xs underline"
              >
                Lihat File
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import FullscreenImageModal from "./FullscreenImageModal";

const parentVariant = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15, // delay antar anak
    },
  },
};

const itemVariant = {
  hidden: { opacity: 0, scale: 0.9 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3 },
  },
};

export default function AttachmentsGallery({
  files = [],
  title,
  // eslint-disable-next-line no-unused-vars
  baseUrl,
  className = "",
}) {
  const [openSrc, setOpenSrc] = useState(null);

  const envApi = import.meta.env.VITE_API_URL;
  if (!envApi) {
    console.error("AttachmentsGallery: VITE_API_URL missing");
    return null;
  }

  const resolvedBase = envApi.replace(/\/api\/?$/i, "");
  const joinUrl = (b, p) =>
    `${b.replace(/\/$/, "")}/${String(p).replace(/^\//, "")}`;

  if (!files || files.length === 0) return null;

  return (
    <div className={`mb-6 ${className}`}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}

      {/* PARENT WITH STAGGER */}
      <motion.div
        variants={parentVariant}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-3"
      >
        {files.map((file, idx) => {
          const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file);
          const fileUrl = joinUrl(resolvedBase, file);

          return (
            <motion.div
              key={idx}
              variants={itemVariant}
              className="w-28 h-28 bg-base-200 rounded-lg overflow-hidden"
            >
              {isImage ? (
                <img
                  src={fileUrl}
                  alt={`${title || "Lampiran"} ${idx + 1}`}
                  className="object-cover w-full h-full cursor-pointer"
                  onClick={() => setOpenSrc(fileUrl)}
                />
              ) : (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center w-full h-full text-xs underline"
                >
                  Lihat File
                </a>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      <FullscreenImageModal
        src={openSrc}
        alt={title}
        onClose={() => setOpenSrc(null)}
      />
    </div>
  );
}

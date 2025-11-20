import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  updateWorkOrderProgress,
  fetchWorkOrderById,
} from "../../features/workOrders/workOrdersSlice";

export default function StaffProgress({
  selected,
  isAssignedStaff,
  onComplete,
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState([]);

  if (!isAssignedStaff) return null;

  const handleStart = async () => {
    if (!selected?._id) return;
    setLoading(true);
    const res = await dispatch(
      updateWorkOrderProgress({ id: selected._id, action: "START_WORK" })
    );
    setLoading(false);
    if (!res?.error) {
      if (onComplete)
        onComplete({ type: "success", text: "🚀 Mulai dikerjakan!" });
      dispatch(fetchWorkOrderById(selected._id));
    } else {
      if (onComplete)
        onComplete({ type: "error", text: "Gagal memulai pekerjaan" });
    }
  };

  const handleRequestConfirmation = async () => {
    if (!selected?._id) return;
    setLoading(true);
    try {
      await dispatch(
        updateWorkOrderProgress({
          id: selected._id,
          action: "REQUEST_CONFIRMATION",
          files,
        })
      ).unwrap();
      if (onComplete)
        onComplete({
          type: "success",
          text: "📩 Minta konfirmasi ke Requester berhasil!",
        });
      dispatch(fetchWorkOrderById(selected._id));
      setFiles([]);
    } catch (err) {
      if (onComplete)
        onComplete({ type: "error", text: err || "Gagal meminta konfirmasi" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="font-semibold mb-3">Progress Pekerjaan (IT Staff)</h3>

      {/* START WORK */}
      {selected.status === "ASSIGNED_TO_STAFF" && (
        <button
          className="btn btn-primary w-full"
          disabled={loading}
          onClick={handleStart}
        >
          🚀 Mulai Kerja
        </button>
      )}

      {/* REQUEST CONFIRMATION + optional foto */}
      {selected.status === "IN_PROGRESS" && (
        <div className="mt-4 flex flex-col gap-3">
          <h3 className="font-semibold mb-2">
            Lampirkan Foto Hasil Pekerjaan (opsional)
          </h3>

          {/* Upload Button */}
          <label className="btn btn-outline w-40 cursor-pointer">
            Pilih Foto
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
              onChange={(e) => {
                const selected = Array.from(e.target.files || []);
                if (selected.length > 2) {
                  alert("Maksimal 2 foto yang dapat dipilih");
                  // keep only first 2
                  setFiles(selected.slice(0, 2));
                  // reset input so user can re-select if needed
                  e.target.value = "";
                } else {
                  setFiles(selected);
                }
              }}
            />
          </label>

          {/* Preview Selected Files */}
          {files?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="w-20 h-20 bg-base-200 rounded-lg overflow-hidden relative"
                >
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx + 1}`}
                    className="object-cover w-full h-full"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 btn btn-xs btn-error"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            className="btn btn-success w-full"
            disabled={loading || files.length > 2}
            onClick={handleRequestConfirmation}
          >
            📩 Minta Konfirmasi
          </button>
        </div>
      )}
    </div>
  );
}

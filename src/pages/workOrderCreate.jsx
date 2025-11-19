// src/pages/WorkOrderCreate.jsx
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createWorkOrder } from "../features/workOrders/workOrdersSlice";
import { useNavigate } from "react-router-dom";

export default function WorkOrderCreate() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token } = useSelector((s) => s.auth);
  const { error } = useSelector((s) => s.workOrders);

  const now = new Date();
  const tzOffset = now.getTimezoneOffset() * 60000;
  const localISOTime = new Date(now - tzOffset).toISOString().slice(0, 16);

  const [formData, setFormData] = useState({
    departmentId: "",
    title: "",
    description: "",
    incidentDate: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [previews, setPreviews] = useState([]);
  const previewsRef = useRef(previews);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    previewsRef.current = previews;
  }, [previews]);

  useEffect(() => {
    return () => {
      (previewsRef.current || []).forEach((p) => {
        try {
          URL.revokeObjectURL(p.url);
        } catch (e) {
          void e;
        }
      });
    };
  }, []);

  const [departments, setDepartments] = useState([]);

  // --- Alerts (DaisyUI) ---
  const [alerts, setAlerts] = useState([]);

  const removeAlert = (id) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  };

  const showToast = (msg, type = "info") => {
    const id = Date.now() + Math.random();
    setAlerts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => removeAlert(id), 3000);
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token || !user?.activeOrganization) return;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/departments/by-org/${
            user.activeOrganization
          }`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await res.json();
        if (res.ok) {
          setDepartments(data.data || []);
        }
      } catch (err) {
        console.error("Department fetch error:", err);
      }
    };

    fetchDepartments();
  }, [token, user?.activeOrganization]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      showToast("Maksimal 2 file!", "error");
      return;
    }

    previews.forEach((p) => URL.revokeObjectURL(p.url));

    setAttachments(files);
    setPreviews(files.map((f) => ({ file: f, url: URL.createObjectURL(f) })));
  };

  const removeAttachment = (index) => {
    const toRemove = previews[index];
    if (toRemove) URL.revokeObjectURL(toRemove.url);

    setAttachments((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // cegah double submit
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!formData.departmentId || !formData.title || !formData.description) {
      showToast("Semua field wajib diisi kecuali lampiran.", "warning");
      setIsSubmitting(false); // re-enable tombol jika gagal validasi
      return;
    }

    const payload = new FormData();
    payload.append("departmentId", formData.departmentId);
    payload.append("title", formData.title);
    payload.append("description", formData.description);

    if (formData.incidentDate) {
      const isoDate = new Date(formData.incidentDate).toISOString();
      payload.append("incidentDate", isoDate);
    }

    attachments.forEach((file) => payload.append("attachments", file));

    const result = await dispatch(createWorkOrder(payload));

    if (result.meta?.requestStatus === "fulfilled") {
      showToast("Work Order berhasil dibuat!", "success");

      // Delay 2 detik untuk UX
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } else {
      showToast(result.payload || "Gagal membuat Work Order", "error");
      setIsSubmitting(false); // aktifkan lagi tombol kalau gagal
    }
  };

  return (
    <>
      {/* --- ALERTS CONTAINER (DaisyUI alerts) --- */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {alerts.map((a) => (
          <div key={a.id} className={`alert alert-${a.type} shadow-lg`}>
            <div className="flex-1">
              <span>{a.msg}</span>
            </div>
            <div className="flex-none">
              <button
                type="button"
                className="btn btn-sm btn-ghost btn-circle"
                onClick={() => removeAlert(a.id)}
                aria-label="Close alert"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Buat Work Order</h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-base-200 p-6 rounded-xl shadow"
        >
          {/* Department */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Department Tujuan
              </span>
            </label>
            <select
              name="departmentId"
              className="select select-bordered w-full"
              value={formData.departmentId}
              onChange={handleChange}
              required
            >
              <option value="">-- Pilih Department --</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Judul */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Judul</span>
            </label>
            <input
              type="text"
              name="title"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Deskripsi */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Deskripsi</span>
            </label>
            <textarea
              name="description"
              className="textarea textarea-bordered w-full"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* Tanggal */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Tanggal & Jam Kejadian
              </span>
            </label>
            <input
              type="datetime-local"
              name="incidentDate"
              value={formData.incidentDate}
              max={localISOTime}
              onChange={handleChange}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* File Upload */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">
                Lampiran (Opsional, max 2 file gambar)
              </span>
            </label>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="file-input file-input-bordered w-full"
            />

            {/* PREVIEW FIXED */}
            {previews.length > 0 && (
              <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                {previews.map((p, idx) => (
                  <div key={idx} className="relative group w-fit">
                    {/* Close Button — NOW CLICKABLE */}
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="
                        absolute -top-2 -right-2 
                        btn btn-xs btn-circle btn-error text-white 
                        z-50 pointer-events-auto
                      "
                    >
                      ✕
                    </button>

                    <img
                      src={p.url}
                      alt={p.file.name}
                      className="w-28 h-28 object-cover rounded-xl border shadow"
                    />

                    <p className="text-xs text-gray-600 mt-1 w-28 truncate text-center">
                      {p.file.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tombol */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="btn btn-success flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Mengirim..." : "Submit"}
            </button>

            <button
              type="button"
              className="btn btn-default flex-1"
              onClick={() => navigate("/dashboard")}
            >
              Batal
            </button>
          </div>

          {error && <p className="text-error mt-2">{error}</p>}
        </form>
      </div>
    </>
  );
}

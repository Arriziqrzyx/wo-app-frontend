import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  approveWorkOrderByTargetSupervisor,
  fetchWorkOrderById,
} from "../../features/workOrders/workOrdersSlice";

export default function AssignModal({
  id = "assign_modal",
  loading,
  staffList = [],
  selectedId,
  onComplete,
}) {
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const dispatch = useDispatch();

  const handleAssign = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    const res = await dispatch(
      approveWorkOrderByTargetSupervisor({
        id: selectedId,
        action: "approve",
        assignedStaffIds: selectedStaffIds,
      })
    );
    setSubmitting(false);
    try {
      document.getElementById(id).close();
    } catch {}

    if (!res?.error) {
      if (onComplete) onComplete({ success: true });
      dispatch(fetchWorkOrderById(selectedId));
    } else {
      if (onComplete) onComplete({ success: false });
    }
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-3">Pilih Staff yang Ditugaskan</h3>

        {loading ? (
          <p>Memuat daftar staff...</p>
        ) : (
          <div className="max-h-60 overflow-y-auto border p-2 rounded-lg">
            {staffList.map((staff) => (
              <label
                key={staff._id}
                className="flex items-center gap-2 py-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={selectedStaffIds.includes(staff._id)}
                  onChange={(e) => {
                    if (e.target.checked)
                      setSelectedStaffIds((prev) => [...prev, staff._id]);
                    else
                      setSelectedStaffIds((prev) =>
                        prev.filter((id) => id !== staff._id)
                      );
                  }}
                />
                <span>
                  {staff.name}{" "}
                  <span className="text-xs text-gray-500">{staff.email}</span>
                </span>
              </label>
            ))}
          </div>
        )}

        <div className="modal-action">
          <form method="dialog" className="flex gap-2">
            <button className="btn">Batal</button>
            <button
              type="button"
              className="btn btn-success"
              disabled={selectedStaffIds.length === 0 || submitting}
              onClick={handleAssign}
            >
              Simpan
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  approveWorkOrderBySupervisor,
  approveWorkOrderByTargetSupervisor,
  fetchWorkOrderById,
} from "../../features/workOrders/workOrdersSlice";

export default function ConfirmModal({
  id = "confirm_modal",
  pendingAction,
  approvalContext,
  selectedId,
  onComplete,
}) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e) => {
    e?.preventDefault();
    if (!selectedId || !pendingAction || !approvalContext) return;
    setLoading(true);

    let res;
    if (approvalContext === "requester") {
      res = await dispatch(
        approveWorkOrderBySupervisor({ id: selectedId, action: pendingAction })
      );
    } else if (approvalContext === "target") {
      res = await dispatch(
        approveWorkOrderByTargetSupervisor({
          id: selectedId,
          action: pendingAction,
        })
      );
    }

    setLoading(false);
    try {
      document.getElementById(id).close();
    } catch {}

    if (!res?.error) {
      if (onComplete) onComplete({ success: true, action: pendingAction });
      dispatch(fetchWorkOrderById(selectedId));
    } else {
      if (onComplete) onComplete({ success: false });
    }
  };

  return (
    <dialog id={id} className="modal">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-2">
          Konfirmasi {pendingAction === "approve" ? "Persetujuan" : "Penolakan"}
        </h3>
        <p className="text-sm mb-4">
          Yakin ingin{" "}
          <strong>
            {pendingAction === "approve" ? "menyetujui" : "menolak"}
          </strong>{" "}
          WO ini?
        </p>
        <div className="modal-action">
          <form method="dialog" className="flex gap-2" onSubmit={handleConfirm}>
            <button className="btn">Batal</button>
            <button
              type="submit"
              className={`btn ${
                pendingAction === "approve" ? "btn-success" : "btn-error"
              }`}
              disabled={loading}
            >
              Ya, {pendingAction === "approve" ? "Approve" : "Reject"}
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
}

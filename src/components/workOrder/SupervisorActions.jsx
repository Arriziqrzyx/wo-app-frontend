import React from "react";

export default function SupervisorActions({
  showRequester,
  showTarget,
  actionLoading,
  onApproveRequester,
  onRejectRequester,
  onOpenAssignModal,
  onRejectTarget,
}) {
  return (
    <>
      {showRequester && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-3">
            Supervisor Approval (Requester Dept)
          </h3>
          <div className="flex gap-3">
            <button
              className="btn btn-success flex-1"
              disabled={actionLoading}
              onClick={onApproveRequester}
            >
              ✅ Approve
            </button>
            <button
              className="btn btn-error flex-1"
              disabled={actionLoading}
              onClick={onRejectRequester}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}

      {showTarget && (
        <div className="mt-6 border-t pt-4">
          <h3 className="font-semibold mb-3">
            Supervisor Approval (Target Dept)
          </h3>
          <div className="flex gap-3 mb-3">
            <button
              className="btn btn-success flex-1"
              disabled={actionLoading}
              onClick={onOpenAssignModal}
            >
              ✅ Approve & Assign Staff
            </button>
            <button
              className="btn btn-error flex-1"
              disabled={actionLoading}
              onClick={onRejectTarget}
            >
              ❌ Reject
            </button>
          </div>
        </div>
      )}
    </>
  );
}

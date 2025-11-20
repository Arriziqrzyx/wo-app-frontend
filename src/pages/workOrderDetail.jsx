// src/pages/WorkOrderDetail.jsx
import { useEffect, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchWorkOrderById,
  fetchStaffByDepartment,
} from "../features/workOrders/workOrdersSlice";

import WorkOrderHeader from "../components/workOrder/WorkOrderHeader";
import AttachmentsGallery from "../components/workOrder/AttachmentsGallery";
import WorkOrderHistory from "../components/workOrder/WorkOrderHistory";
import SupervisorActions from "../components/workOrder/SupervisorActions";
import AssignModal from "../components/workOrder/AssignModal";
import ConfirmModal from "../components/workOrder/ConfirmModal";
import StaffProgress from "../components/workOrder/StaffProgress";
import RequesterConfirmation from "../components/workOrder/RequesterConfirmation";
import LogoForOrg from "../components/ui/LogoForOrg";
import printWithDefaults from "../utils/print";

export default function WorkOrderDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    selected,
    loading,
    error,
    supervisorRoleContext,
    staffList = [],
  } = useSelector((s) => s.workOrders);
  const { user } = useSelector((s) => s.auth);

  const [actionLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [approvalContext, setApprovalContext] = useState(null);
  const [toast, setToast] = useState(null);

  // 🔹 Fetch WO Detail
  useEffect(() => {
    if (id) dispatch(fetchWorkOrderById(id));
  }, [dispatch, id]);

  // confirmation handled inside ConfirmModal

  // Handlers passed to components
  const handleBack = () => navigate(-1);

  const onApproveRequester = () => {
    setPendingAction("approve");
    setApprovalContext("requester");
    document.getElementById("confirm_modal").showModal();
  };

  const onRejectRequester = () => {
    setPendingAction("reject");
    setApprovalContext("requester");
    document.getElementById("confirm_modal").showModal();
  };

  const onOpenAssignModal = async () => {
    await dispatch(fetchStaffByDepartment(selected.departmentId?._id));
    document.getElementById("assign_modal").showModal();
  };

  const onRejectTarget = () => {
    setPendingAction("reject");
    setApprovalContext("target");
    document.getElementById("confirm_modal").showModal();
  };

  // staff progress and assign handled inside components

  // 🔹 Supervisor Context
  const showSupervisorButtons =
    user?.role === "supervisor" &&
    selected?.status === "WAITING_SUPERVISOR_APPROVAL" &&
    supervisorRoleContext === "requester";

  const showTargetSupervisorButtons =
    user?.role === "supervisor" &&
    selected?.status === "WAITING_TARGET_REVIEW" &&
    supervisorRoleContext === "target";

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  // 🔹 Staff yang ditugaskan (helper)
  const isAssignedStaff = Array.isArray(selected?.assignedStaffIds)
    ? selected.assignedStaffIds.some(
        (st) => st?._id === user?.id || st === user?.id
      )
    : false;

  // 🔹 Kondisi UI
  if (loading)
    return (
      <div className="p-6 text-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="mt-2">Memuat detail...</p>
      </div>
    );

  if (error)
    return (
      <div className="p-6 text-center">
        <p className="text-error">{error}</p>
      </div>
    );

  if (!selected) return null;

  // =====================================================
  // 🧩 RENDER DETAIL
  // =====================================================
  return (
    <div className="p-4 bg-base-200 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <WorkOrderHeader
          onBack={handleBack}
          rightActions={
            <button
              className="btn btn-outline btn-sm no-print"
              onClick={() => printWithDefaults()}
              title="Print"
            >
              🖨️ Print
            </button>
          }
        />

        {/* Card */}
        <motion.div
          id="print-area"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-base-100 shadow py-4 px-6 rounded-xl relative"
        >
          {/* Info utama */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <LogoForOrg
                  activeOrganization={user?.activeOrganization}
                  size={72}
                />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">
                    No. WO: <strong>{selected.woNumber}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    Status:{" "}
                    <span
                      className={`badge ${
                        selected.status === "CLOSED"
                          ? "badge-success"
                          : "badge-info"
                      }`}
                    >
                      {selected.status.replaceAll("_", " ")}
                    </span>
                  </p>
                </div>
              </div>
              <div>
                <h2 className="text-2xl text-gray-500 font-bold">WORK ORDER</h2>
              </div>
            </div>

            <h2 className="text-xl font-semibold">{selected.title}</h2>
            <p>{selected.description}</p>
          </div>

          {/* Grid Info */}
          <div className="grid grid-cols-2 gap-4 mb-6 mt-4 text-sm">
            <div>
              <h3 className="font-semibold">Tanggal Kejadian</h3>
              <p>{formatDate(selected.incidentDate)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Dibuat Pada</h3>
              <p>{formatDate(selected.createdAt)}</p>
            </div>
            <div>
              <h3 className="font-semibold">Requester</h3>
              <p>{selected.requesterId?.name}</p>
            </div>
            <div>
              <h3 className="font-semibold">Departemen Tujuan</h3>
              <p>{selected.departmentId?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AttachmentsGallery
              files={selected.attachments}
              title="Lampiran Requester"
              className="mb-0"
            />
            <AttachmentsGallery
              files={selected.resultPhotos}
              title="Hasil Pekerjaan"
              className="mb-0"
            />
          </div>

          <WorkOrderHistory
            history={selected.history || []}
            formatDate={formatDate}
          />

          <SupervisorActions
            showRequester={showSupervisorButtons}
            showTarget={showTargetSupervisorButtons}
            actionLoading={actionLoading}
            onApproveRequester={onApproveRequester}
            onRejectRequester={onRejectRequester}
            onOpenAssignModal={onOpenAssignModal}
            onRejectTarget={onRejectTarget}
          />

          {(selected.status === "ASSIGNED_TO_STAFF" ||
            selected.status === "IN_PROGRESS") && (
            <StaffProgress
              selected={selected}
              isAssignedStaff={isAssignedStaff}
              onComplete={(payload) => {
                setToast({ type: payload.type, text: payload.text });
                setTimeout(() => setToast(null), 3000);
              }}
            />
          )}

          {/* REQUESTER CONFIRMATION SECTION */}
          {user?.id === selected?.requesterId?._id &&
            selected.status === "WAITING_REQUESTER_CONFIRMATION" && (
              <RequesterConfirmation
                selectedId={selected._id}
                onComplete={(payload) => {
                  setToast({ type: payload.type, text: payload.text });
                  setTimeout(() => setToast(null), 3000);
                }}
              />
            )}

          <div className="mt-6 text-right text-sm text-gray-500">
            Dilihat oleh: <strong>{user?.name}</strong> ({user?.role})
          </div>
        </motion.div>
      </div>

      <ConfirmModal
        id="confirm_modal"
        pendingAction={pendingAction}
        approvalContext={approvalContext}
        selectedId={selected._id}
        onComplete={(res) => {
          // clear pending state and show toast
          setPendingAction(null);
          setApprovalContext(null);
          if (res?.success) {
            setToast({
              type: res.action === "approve" ? "success" : "error",
              text:
                res.action === "approve"
                  ? "✅ Work Order disetujui!"
                  : "❌ Work Order ditolak!",
            });
          } else {
            setToast({ type: "error", text: "Terjadi kesalahan, coba lagi." });
          }
          setTimeout(() => setToast(null), 3000);
        }}
      />

      <AssignModal
        id="assign_modal"
        loading={loading}
        staffList={staffList}
        selectedId={selected._id}
        onComplete={(res) => {
          if (res?.success)
            setToast({
              type: "success",
              text: "✅ WO disetujui dan ditugaskan!",
            });
          else setToast({ type: "error", text: "Gagal menyetujui WO" });
          setTimeout(() => setToast(null), 3000);
        }}
      />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`alert ${
                toast.type === "success" ? "alert-success" : "alert-error"
              } shadow-lg`}
            >
              <span>{toast.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

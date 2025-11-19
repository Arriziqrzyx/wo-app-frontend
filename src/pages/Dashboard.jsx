import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { fetchWorkOrders } from "../features/workOrders/workOrdersSlice";
import { switchOrg } from "../features/auth/authThunks";
import { logout } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import LogoForOrg from "../components/ui/LogoForOrg";

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user } = useSelector((s) => s.auth);
  const token = useSelector((s) => s.auth.token);
  const { list, loading, error } = useSelector((s) => s.workOrders);

  // 🔹 Fetch WO setiap kali token atau organisasi aktif berubah
  useEffect(() => {
    console.log("🎯 Dashboard useEffect triggered");
    console.log("🎯 Active Org:", user?.activeOrganization);
    console.log("🎯 Token:", token);

    if (token) dispatch(fetchWorkOrders());
  }, [dispatch, token, user?.activeOrganization]);

  // 🔹 Ganti organisasi aktif
  const handleSwitch = (e) => {
    dispatch(switchOrg(e.target.value));
  };

  // 🔹 Logout
  const handleLogout = () => {
    dispatch(logout());
  };

  // 🔹 Fungsi kecil untuk badge status warna berbeda
  const getStatusBadge = (status) => {
    const map = {
      WAITING_SUPERVISOR_APPROVAL: "badge-warning",
      WAITING_TARGET_REVIEW: "badge-info",
      IN_PROGRESS: "badge-primary",
      CLOSED: "badge-success",
      REJECTED: "badge-error",
    };
    return map[status] || "badge-ghost";
  };

  // 🔹 Format tanggal lokal
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <LogoForOrg activeOrganization={user?.activeOrganization} />
          <h1 className="text-xl font-bold">WORK ORDER YPPG</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="select select-bordered"
            onChange={handleSwitch}
            defaultValue={user?.activeOrganization}
          >
            <option value="YPP">YPP</option>
            <option value="GD">GD</option>
            <option value="EEE">EEE</option>
          </select>
          <button className="btn btn-error" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Welcome */}
      <div className="bg-base-200 p-4 rounded-lg mb-6">
        <p>
          Selamat datang, <strong>{user?.name}</strong> 😄
        </p>
      </div>

      {/* Work Orders Section */}
      <div className="bg-base-100 shadow rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold">Daftar Work Order</h2>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => navigate("/workorders/new")}
          >
            + Buat WO
          </button>
        </div>

        {loading && <p>Memuat data...</p>}
        {error && <p className="text-error">{error}</p>}

        {!loading && list.length === 0 && (
          <p className="text-gray-500">Belum ada Work Order</p>
        )}

        {!loading && list.length > 0 && (
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead>
                <tr>
                  <th>#</th>
                  <th>No. WO</th>
                  <th>Judul</th>
                  <th>Requester</th>
                  <th>Departemen</th>
                  <th>Status</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((wo, idx) => (
                  <tr key={wo._id}>
                    <td>{idx + 1}</td>
                    <td>{wo.woNumber || "-"}</td>
                    <td className="font-medium">{wo.title}</td>
                    <td>{wo.requesterId?.name || "-"}</td>
                    <td>{wo.departmentId?.name || "-"}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(wo.status)}`}>
                        {wo.status.replaceAll("_", " ")}
                      </span>
                    </td>
                    <td>{formatDate(wo.createdAt)}</td>
                    <td>
                      <button
                        className="btn btn-xs btn-outline"
                        onClick={() => navigate(`/workorders/${wo._id}`)}
                      >
                        Lihat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

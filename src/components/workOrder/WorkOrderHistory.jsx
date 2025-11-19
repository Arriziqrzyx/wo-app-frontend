import React from "react";

export default function WorkOrderHistory({ history = [], formatDate }) {
  return (
    <div className="mt-4">
      <h3 className="font-semibold mb-2">Riwayat Status</h3>
      <div className="overflow-x-auto">
        <table className="table table-sm table-zebra w-full text-sm">
          <thead>
            <tr>
              <th>#</th>
              <th>Aksi</th>
              <th>Dari → Ke</th>
              <th>Catatan</th>
              <th>Oleh</th>
              <th>Waktu</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{h.action}</td>
                <td>
                  {h.fromStatus
                    ? `${h.fromStatus.replaceAll(
                        "_",
                        " "
                      )} → ${h.toStatus.replaceAll("_", " ")}`
                    : h.toStatus.replaceAll("_", " ")}
                </td>
                <td>{h.note || "-"}</td>
                <td className="px-4 py-2">
                  {h.performedBy?.name}
                  {h.role === "staff" && h.affectedStaffIds?.length > 1 && (
                    <>
                      {" "}
                      and{" "}
                      {h.affectedStaffIds
                        .filter((a) => a._id !== h.performedBy?._id)
                        .map((a) => a.name)
                        .join(", ")}
                    </>
                  )}
                </td>
                <td>{formatDate(h.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

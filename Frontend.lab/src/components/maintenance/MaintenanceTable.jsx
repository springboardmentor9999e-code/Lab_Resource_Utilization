import React, { useState } from "react";
import { Link } from "react-router-dom";

const MaintenanceTable = ({
  maintenanceList = [],
  onDelete,
}) => {
  const [search, setSearch] = useState("");

  const filteredList = (maintenanceList || []).filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.issueTitle?.toLowerCase().includes(keyword) ||
      item.technician?.toLowerCase().includes(keyword) ||
      item.status?.toLowerCase().includes(keyword) ||
      String(item.equipmentId || item.equipment?.id || "").includes(keyword)
    );
  });

  const getBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-warning text-dark";

      case "IN_PROGRESS":
        return "bg-primary";

      case "COMPLETED":
        return "bg-success";

      case "CANCELLED":
        return "bg-danger";

      default:
        return "bg-secondary";
    }
  };

  return (
    <div className="card shadow">

      <div className="card-header d-flex justify-content-between align-items-center">

        <h4 className="mb-0">Maintenance List</h4>

        <Link
          to="/maintenance/add"
          className="btn btn-success"
        >
          Add Maintenance
        </Link>

      </div>

      <div className="card-body">

        <div className="mb-3">

          <input
            type="text"
            className="form-control"
            placeholder="Search Maintenance..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <div className="table-responsive">

          <table className="table table-bordered table-hover align-middle">

            <thead className="table-dark">

              <tr>
                <th>ID</th>
                <th>Equipment</th>
                <th>Issue</th>
                <th>Technician</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Expected Completion</th>
                <th>Cost</th>
                <th width="220">
                  Actions
                </th>
              </tr>

            </thead>

            <tbody>

              {filteredList.length === 0 ? (

                <tr>
                  <td
                    colSpan="10"
                    className="text-center py-4"
                  >
                    No Maintenance Found
                  </td>
                </tr>

              ) : (

                filteredList.map((item) => (

                  <tr key={item.id}>

                    <td>{item.id}</td>

                    <td>{item.equipment?.equipmentName || item.equipmentId}</td>

                    <td>{item.issueTitle}</td>

                    <td>{item.technician}</td>

                    <td>{item.priority}</td>

                    <td>

                      <span
                        className={`badge ${getBadge(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>

                    </td>

                    <td>{item.startDate}</td>

                    <td>
                      {item.expectedCompletion}
                    </td>

                    <td>₹ {item.cost ?? 0}</td>

                    <td>
                      <Link
                        to={`/maintenance/view/${item.id}`}
                        className="btn btn-info btn-sm me-2 text-white"
                      >
                        View
                      </Link>

                      <Link
                        to={`/maintenance/edit/${item.id}`}
                        className="btn btn-warning btn-sm me-2"
                      >
                        Edit
                      </Link>

                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              "Are you sure you want to delete this maintenance record?"
                            )
                          ) {
                            onDelete && onDelete(item.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>

                ))
              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
};

export default MaintenanceTable;

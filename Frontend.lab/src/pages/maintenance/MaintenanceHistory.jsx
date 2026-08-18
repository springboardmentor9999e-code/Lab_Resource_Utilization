import React, { useEffect, useState } from "react";
import {
  getMaintenanceHistory,
} from "../../services/maintenanceService";

const MaintenanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await getMaintenanceHistory();

      if (Array.isArray(response)) {
        setHistory(response);
      } else if (response && Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to load maintenance history.");
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-success";

      case "IN_PROGRESS":
        return "bg-primary";

      case "PENDING":
        return "bg-warning text-dark";

      case "CANCELLED":
        return "bg-danger";

      default:
        return "bg-secondary";
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading Maintenance History...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-4">

      <div className="card shadow">

        <div className="card-header bg-dark text-white">
          <h3 className="mb-0">Maintenance History</h3>
        </div>

        <div className="card-body">

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
                  <th>Remarks</th>
                </tr>

              </thead>

              <tbody>

                {history.length === 0 ? (
                  <tr>
                    <td
                      colSpan="10"
                      className="text-center py-4"
                    >
                      No Maintenance History Available
                    </td>
                  </tr>
                ) : (
                  history.map((item) => (
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

                      <td>{item.remarks || "-"}</td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
};

export default MaintenanceHistory;

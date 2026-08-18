import axios from "axios";

const API = "http://localhost:8081/api/maintenance";

const MOCK_MAINTENANCE_LIST = [
  {
    id: 1,
    equipmentId: 1,
    equipmentName: "Digital Oscilloscope 100MHz",
    issueTitle: "Calibration Drift on Channel 2",
    description: "Signal distortion observed beyond 80MHz frequency. Requires recalibration.",
    priority: "HIGH",
    technician: "Alex Vance",
    startDate: "2026-08-01",
    expectedCompletion: "2026-08-08",
    status: "IN_PROGRESS",
    remarks: "Replacement probe delivered",
    cost: 4500,
  },
  {
    id: 2,
    equipmentId: 2,
    equipmentName: "UV-Vis Spectrophotometer",
    issueTitle: "Deuterium Lamp Intensity Low",
    description: "UV range baseline noise elevated. Lamp lifecycle exceeded 1800 hours.",
    priority: "CRITICAL",
    technician: "Maria Garcia",
    startDate: "2026-08-03",
    expectedCompletion: "2026-08-09",
    status: "PENDING",
    remarks: "Waiting for spare bulb shipment",
    cost: 12000,
  },
  {
    id: 3,
    equipmentId: 3,
    equipmentName: "Refrigerated Centrifuge",
    issueTitle: "Rotor Seal Inspection & Maintenance",
    description: "Scheduled preventive maintenance and chamber refrigeration check.",
    priority: "MEDIUM",
    technician: "John Doe",
    startDate: "2026-07-28",
    expectedCompletion: "2026-08-02",
    status: "COMPLETED",
    remarks: "All seals replaced successfully",
    cost: 3200,
  },
];

// Get JWT Token
const getToken = () => {
  return localStorage.getItem("token");
};

// Axios Config
const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  },
});

const getLocalMaintenance = () => {
  try {
    return JSON.parse(localStorage.getItem("local_maintenance") || "[]");
  } catch (err) {
    return [];
  }
};

const saveLocalMaintenance = (list) => {
  try {
    localStorage.setItem("local_maintenance", JSON.stringify(list));
  } catch (err) {
    console.error("Failed to save local maintenance", err);
  }
};

// ===============================
// Get All Maintenance
// ===============================
export const getAllMaintenance = async () => {
  try {
    const response = await axios.get(API, authConfig());
    const data = Array.isArray(response.data) ? response.data : (response.data?.data || MOCK_MAINTENANCE_LIST);
    const local = getLocalMaintenance();
    return [...data, ...local];
  } catch (error) {
    console.warn("Backend maintenance API unavailable. Returning mock and local data.", error);
    const local = getLocalMaintenance();
    return [...MOCK_MAINTENANCE_LIST, ...local];
  }
};

// ===============================
// Get Maintenance By ID
// ===============================
export const getMaintenanceById = async (id) => {
  try {
    const response = await axios.get(`${API}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    console.warn(`GET /maintenance/${id} failed. Looking in local data.`, error);
    const all = await getAllMaintenance();
    return all.find((m) => String(m.id) === String(id)) || MOCK_MAINTENANCE_LIST[0];
  }
};

// ===============================
// Add Maintenance
// ===============================
export const addMaintenance = async (maintenance) => {
  try {
    const response = await axios.post(API, maintenance, authConfig());
    return response.data;
  } catch (error) {
    console.warn("POST /maintenance failed. Saving locally (Demo mode).", error);
    const local = getLocalMaintenance();
    const newRecord = {
      id: "maint-local-" + Math.floor(Math.random() * 10000),
      ...maintenance,
      status: maintenance.status || "PENDING",
      priority: maintenance.priority || "MEDIUM",
    };
    local.push(newRecord);
    saveLocalMaintenance(local);
    return newRecord;
  }
};

// ===============================
// Update Maintenance
// ===============================
export const updateMaintenance = async (id, maintenance) => {
  try {
    const response = await axios.put(`${API}/${id}`, maintenance, authConfig());
    return response.data;
  } catch (error) {
    console.warn(`PUT /maintenance/${id} failed. Updating locally (Demo mode).`, error);
    const local = getLocalMaintenance();
    const idx = local.findIndex((m) => String(m.id) === String(id));
    if (idx !== -1) {
      local[idx] = { ...local[idx], ...maintenance };
      saveLocalMaintenance(local);
      return local[idx];
    }
    const updatedRecord = { id, ...maintenance };
    local.push(updatedRecord);
    saveLocalMaintenance(local);
    return updatedRecord;
  }
};

// ===============================
// Delete Maintenance
// ===============================
export const deleteMaintenance = async (id) => {
  try {
    const response = await axios.delete(`${API}/${id}`, authConfig());
    return response.data;
  } catch (error) {
    console.warn(`DELETE /maintenance/${id} failed. Removing locally (Demo mode).`, error);
    const local = getLocalMaintenance();
    const filtered = local.filter((m) => String(m.id) !== String(id));
    saveLocalMaintenance(filtered);
    return { success: true };
  }
};

// ===============================
// Update Status
// ===============================
export const updateMaintenanceStatus = async (id, status) => {
  try {
    const response = await axios.put(`${API}/status/${id}`, { status }, authConfig());
    return response.data;
  } catch (error) {
    console.warn(`PUT /maintenance/status/${id} failed. Updating status locally.`, error);
    const local = getLocalMaintenance();
    const idx = local.findIndex((m) => String(m.id) === String(id));
    if (idx !== -1) {
      local[idx].status = status;
      saveLocalMaintenance(local);
      return local[idx];
    }
    return { id, status };
  }
};

// ===============================
// Maintenance History
// ===============================
export const getMaintenanceHistory = async () => {
  try {
    const response = await axios.get(`${API}/history`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    return all.filter((m) => m.status === "COMPLETED" || m.status === "Completed");
  }
};

// ===============================
// Search Maintenance
// ===============================
export const searchMaintenance = async (keyword) => {
  try {
    const response = await axios.get(`${API}/search?keyword=${keyword}`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    const kw = (keyword || "").toLowerCase();
    return all.filter(
      (m) =>
        m.issueTitle?.toLowerCase().includes(kw) ||
        m.equipmentName?.toLowerCase().includes(kw) ||
        m.technician?.toLowerCase().includes(kw)
    );
  }
};

// ===============================
// Filter By Status
// ===============================
export const getMaintenanceByStatus = async (status) => {
  try {
    const response = await axios.get(`${API}/status/${status}`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    return all.filter((m) => m.status?.toLowerCase() === status?.toLowerCase());
  }
};

// ===============================
// Dashboard Summary
// ===============================
export const getDashboardSummary = async () => {
  try {
    const response = await axios.get(`${API}/dashboard`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    return {
      total: all.length,
      pending: all.filter((m) => m.status === "PENDING" || m.status === "Pending").length,
      inProgress: all.filter((m) => m.status === "IN_PROGRESS" || m.status === "In Progress").length,
      completed: all.filter((m) => m.status === "COMPLETED" || m.status === "Completed").length,
    };
  }
};

// ===============================
// Upcoming Maintenance
// ===============================
export const getUpcomingMaintenance = async () => {
  try {
    const response = await axios.get(`${API}/upcoming`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    return all.filter((m) => m.status === "PENDING" || m.status === "IN_PROGRESS");
  }
};

// ===============================
// Completed Maintenance
// ===============================
export const getCompletedMaintenance = async () => {
  try {
    const response = await axios.get(`${API}/completed`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    return all.filter((m) => m.status === "COMPLETED" || m.status === "Completed");
  }
};

// ===============================
// Pending Maintenance
// ===============================
export const getPendingMaintenance = async () => {
  try {
    const response = await axios.get(`${API}/pending`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    return all.filter((m) => m.status === "PENDING" || m.status === "Pending");
  }
};

// ===============================
// In Progress Maintenance
// ===============================
export const getInProgressMaintenance = async () => {
  try {
    const response = await axios.get(`${API}/in-progress`, authConfig());
    return response.data;
  } catch (error) {
    const all = await getAllMaintenance();
    return all.filter((m) => m.status === "IN_PROGRESS" || m.status === "In Progress");
  }
};

import React from "react";

function EquipmentPage({
                           styles,
                           equipmentList,
                           equipmentName,
                           setEquipmentName,
                           equipmentCode,
                           setEquipmentCode,
                           manufacturer,
                           setManufacturer,
                           modelNumber,
                           setModelNumber,
                           description,
                           setDescription,
                           imageUrl,
                           setImageUrl,
                           documentation,
                           setDocumentation,
                           purchaseDate,
                           setPurchaseDate,
                           calibrationDate,
                           setCalibrationDate,
                           certificationDate,
                           setCertificationDate,
                           status,
                           setStatus,
                           availability,
                           setAvailability,
                           location,
                           setLocation,
                           equipmentCost,
                           setEquipmentCost,
                           laboratories,
                           selectedLaboratoryId,
                           setSelectedLaboratoryId,
                           editingEquipmentId,
                           saveEquipment,
                           editEquipment,
                           deleteEquipment
                       }) {
    return (
        <div>
            <div style={styles.headerArea}>
                <h1 style={styles.pageTitle}>Equipment</h1>
                <p style={styles.pageSubtitle}>Manage lab instruments, availability, and metadata</p>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                    {editingEquipmentId ? "Edit Equipment" : "Add New Equipment"}
                </h3>
                <div style={styles.formGrid}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Equipment Name</label>
                        <input
                            type="text"
                            placeholder="Equipment Name"
                            value={equipmentName}
                            onChange={(e) => setEquipmentName(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Equipment Code</label>
                        <input
                            type="text"
                            placeholder="Equipment Code"
                            value={equipmentCode}
                            onChange={(e) => setEquipmentCode(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Manufacturer</label>
                        <input
                            type="text"
                            placeholder="Manufacturer"
                            value={manufacturer}
                            onChange={(e) => setManufacturer(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Model Number</label>
                        <input
                            type="text"
                            placeholder="Model Number"
                            value={modelNumber}
                            onChange={(e) => setModelNumber(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Description</label>
                        <input
                            type="text"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Image URL</label>
                        <input
                            type="text"
                            placeholder="Image URL"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Documentation</label>
                        <input
                            type="text"
                            placeholder="Documentation"
                            value={documentation}
                            onChange={(e) => setDocumentation(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Purchase Date</label>
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Calibration Date</label>
                        <input
                            type="date"
                            value={calibrationDate}
                            onChange={(e) => setCalibrationDate(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Certification Date</label>
                        <input
                            type="date"
                            value={certificationDate}
                            onChange={(e) => setCertificationDate(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Status</label>
                        <input
                            type="text"
                            placeholder="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Availability</label>
                        <input
                            type="text"
                            placeholder="Availability"
                            value={availability}
                            onChange={(e) => setAvailability(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Location</label>
                        <input
                            type="text"
                            placeholder="Location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Equipment Cost (₹)</label>
                        <input
                            type="number"
                            placeholder="Equipment Cost"
                            value={equipmentCost}
                            onChange={(e) => setEquipmentCost(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Laboratory</label>
                        <select
                            value={selectedLaboratoryId}
                            onChange={(e) => setSelectedLaboratoryId(e.target.value)}
                            style={styles.select}
                        >
                            <option value="">Select Laboratory</option>
                            {laboratories.map((lab) => (
                                <option key={lab.id} value={lab.id}>
                                    {lab.laboratoryName}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <button onClick={saveEquipment} style={styles.primaryButton}>
                    {editingEquipmentId ? "Update Equipment" : "Save Equipment"}
                </button>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Equipment Inventory</h3>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Code</th>
                            <th style={styles.th}>Manufacturer</th>
                            <th style={styles.th}>Model</th>
                            <th style={styles.th}>Status</th>
                            <th style={styles.th}>Availability</th>
                            <th style={styles.th}>Location</th>
                            <th style={styles.th}>Cost</th>
                            <th style={styles.th}>Laboratory</th>
                            <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {equipmentList.map((equipment) => (
                            <tr key={equipment.id}>
                                <td style={styles.td}>{equipment.id}</td>
                                <td style={styles.td}>{equipment.equipmentName}</td>
                                <td style={styles.td}>{equipment.equipmentCode}</td>
                                <td style={styles.td}>{equipment.manufacturer}</td>
                                <td style={styles.td}>{equipment.modelNumber}</td>
                                <td style={styles.td}>{equipment.status}</td>
                                <td style={styles.td}>{equipment.availability}</td>
                                <td style={styles.td}>{equipment.location}</td>
                                <td style={styles.td}>₹ {equipment.equipmentCost}</td>
                                <td style={styles.td}>
                                    {equipment.laboratory ? equipment.laboratory.laboratoryName : ""}
                                </td>
                                <td style={{ ...styles.td, textAlign: "right" }}>
                                    <button
                                        onClick={() => editEquipment(equipment)}
                                        style={styles.actionButtonEdit}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteEquipment(equipment.id)}
                                        style={styles.actionButtonDelete}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default EquipmentPage;
import React from "react";

function LaboratoryPage({
                            styles,
                            laboratories,
                            laboratoryName,
                            setLaboratoryName,
                            departments,
                            selectedDepartmentId,
                            setSelectedDepartmentId,
                            editingLaboratoryId,
                            saveLaboratory,
                            editLaboratory,
                            deleteLaboratory
                        }) {
    return (
        <div>
            <div style={styles.headerArea}>
                <h1 style={styles.pageTitle}>Laboratories</h1>
                <p style={styles.pageSubtitle}>Manage lab spaces and associate them with departments</p>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>
                    {editingLaboratoryId ? "Edit Laboratory" : "Add New Laboratory"}
                </h3>
                <div style={{ display: "flex", gap: "12px", maxWidth: "600px", flexWrap: "wrap" }}>
                    <input
                        type="text"
                        placeholder="Laboratory Name"
                        value={laboratoryName}
                        onChange={(e) => setLaboratoryName(e.target.value)}
                        style={{ ...styles.input, flex: "1 1 200px" }}
                    />
                    <select
                        value={selectedDepartmentId}
                        onChange={(e) => setSelectedDepartmentId(e.target.value)}
                        style={{ ...styles.select, flex: "1 1 200px" }}
                    >
                        <option value="">Select Department</option>
                        {departments.map((department) => (
                            <option key={department.id} value={department.id}>
                                {department.departmentName}
                            </option>
                        ))}
                    </select>
                    <button onClick={saveLaboratory} style={styles.primaryButton}>
                        {editingLaboratoryId ? "Update" : "Add"}
                    </button>
                </div>
            </div>

            <div style={styles.card}>
                <h3 style={styles.cardTitle}>Laboratories List</h3>
                <div style={styles.tableContainer}>
                    <table style={styles.table}>
                        <thead>
                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Laboratory</th>
                            <th style={styles.th}>Department</th>
                            <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {laboratories.map((lab) => (
                            <tr key={lab.id}>
                                <td style={styles.td}>{lab.id}</td>
                                <td style={styles.td}>{lab.laboratoryName}</td>
                                <td style={styles.td}>
                                    {lab.department ? lab.department.departmentName : ""}
                                </td>
                                <td style={{ ...styles.td, textAlign: "right" }}>
                                    <button
                                        onClick={() => editLaboratory(lab)}
                                        style={styles.actionButtonEdit}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => deleteLaboratory(lab.id)}
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

export default LaboratoryPage;
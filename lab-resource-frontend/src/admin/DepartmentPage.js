import React from "react";

function DepartmentPage({
                            styles,
                            departments,
                            departmentName,
                            setDepartmentName,
                            editingDepartmentId,
                            saveDepartment,
                            editDepartment,
                            deleteDepartment
                        }) {
    return (
        <div>

            <div style={styles.headerArea}>
                <h1 style={styles.pageTitle}>Departments</h1>

                <p style={styles.pageSubtitle}>
                    Manage academic and research departments
                </p>
            </div>

            <div style={styles.card}>

                <h3 style={styles.cardTitle}>
                    {editingDepartmentId
                        ? "Edit Department"
                        : "Add New Department"}
                </h3>

                <div
                    style={{
                        display: "flex",
                        gap: "12px",
                        maxWidth: "500px"
                    }}
                >

                    <input
                        type="text"
                        placeholder="Department Name"
                        value={departmentName}
                        onChange={(e) =>
                            setDepartmentName(e.target.value)
                        }
                        style={{
                            ...styles.input,
                            flex: 1
                        }}
                    />

                    <button
                        onClick={saveDepartment}
                        style={styles.primaryButton}
                    >
                        {editingDepartmentId
                            ? "Update"
                            : "Add"}
                    </button>

                </div>

            </div>

            <div style={styles.card}>

                <h3 style={styles.cardTitle}>
                    Departments List
                </h3>

                <div style={styles.tableContainer}>

                    <table style={styles.table}>

                        <thead>

                        <tr>
                            <th style={styles.th}>ID</th>
                            <th style={styles.th}>Name</th>

                            <th
                                style={{
                                    ...styles.th,
                                    textAlign: "right"
                                }}
                            >
                                Actions
                            </th>
                        </tr>

                        </thead>

                        <tbody>

                        {departments.map((department) => (

                            <tr key={department.id}>

                                <td style={styles.td}>
                                    {department.id}
                                </td>

                                <td style={styles.td}>
                                    {department.departmentName}
                                </td>

                                <td
                                    style={{
                                        ...styles.td,
                                        textAlign: "right"
                                    }}
                                >

                                    <button
                                        style={styles.actionButtonEdit}
                                        onClick={() =>
                                            editDepartment(department)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        style={styles.actionButtonDelete}
                                        onClick={() =>
                                            deleteDepartment(department.id)
                                        }
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

export default DepartmentPage;
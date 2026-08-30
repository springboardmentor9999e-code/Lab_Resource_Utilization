import React from "react";

function InstitutionPage({
                             styles,
                             institutions,
                             institutionName,
                             setInstitutionName,
                             editingInstitutionId,
                             saveInstitution,
                             editInstitution,
                             deleteInstitution
                         }) {
    return (
        <div>

            <div style={styles.headerArea}>
                <h1 style={styles.pageTitle}>Institutions</h1>

                <p style={styles.pageSubtitle}>
                    Manage affiliated institutions and organizations
                </p>
            </div>

            <div style={styles.card}>

                <h3 style={styles.cardTitle}>
                    {editingInstitutionId
                        ? "Edit Institution"
                        : "Add New Institution"}
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
                        placeholder="Institution Name"
                        value={institutionName}
                        onChange={(e) =>
                            setInstitutionName(e.target.value)
                        }
                        style={{
                            ...styles.input,
                            flex: 1
                        }}
                    />

                    <button
                        onClick={saveInstitution}
                        style={styles.primaryButton}
                    >
                        {editingInstitutionId
                            ? "Update"
                            : "Add"}
                    </button>

                </div>

            </div>

            <div style={styles.card}>

                <h3 style={styles.cardTitle}>
                    Institutions List
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

                        {institutions.map((institution) => (

                            <tr key={institution.id}>

                                <td style={styles.td}>
                                    {institution.id}
                                </td>

                                <td style={styles.td}>
                                    {institution.institutionName}
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
                                            editInstitution(institution)
                                        }
                                    >
                                        Edit
                                    </button>

                                    <button
                                        style={styles.actionButtonDelete}
                                        onClick={() =>
                                            deleteInstitution(institution.id)
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

export default InstitutionPage;
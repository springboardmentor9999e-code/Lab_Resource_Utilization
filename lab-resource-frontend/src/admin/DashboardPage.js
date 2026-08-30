import React from "react";

function DashboardPage({ dashboard, styles }) {
    return (
        <div>

            <div style={styles.headerArea}>
                <h1 style={styles.pageTitle}>
                    Dashboard Overview
                </h1>

                <p style={styles.pageSubtitle}>
                    System metrics and resource summaries
                </p>
            </div>

            <div style={styles.statsGrid}>

                <div style={styles.statCard("#3b82f6")}>
                    <span style={styles.statTitle}>
                        Institutions
                    </span>

                    <span style={styles.statValue}>
                        {dashboard.totalInstitutions}
                    </span>
                </div>

                <div style={styles.statCard("#10b981")}>
                    <span style={styles.statTitle}>
                        Departments
                    </span>

                    <span style={styles.statValue}>
                        {dashboard.totalDepartments}
                    </span>
                </div>

                <div style={styles.statCard("#f59e0b")}>
                    <span style={styles.statTitle}>
                        Laboratories
                    </span>

                    <span style={styles.statValue}>
                        {dashboard.totalLaboratories}
                    </span>
                </div>

                <div style={styles.statCard("#8b5cf6")}>
                    <span style={styles.statTitle}>
                        Equipment
                    </span>

                    <span style={styles.statValue}>
                        {dashboard.totalEquipment}
                    </span>
                </div>

                <div style={styles.statCard("#ec4899")}>
                    <span style={styles.statTitle}>
                        Bookings
                    </span>

                    <span style={styles.statValue}>
                        {dashboard.totalBookings}
                    </span>
                </div>

            </div>

        </div>
    );
}

export default DashboardPage;
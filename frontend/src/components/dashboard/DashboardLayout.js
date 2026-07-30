import React from "react";
import "../../App.css";

import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Footer from "../Footer";

function DashboardLayout({ title, children }) {

    return (

        <div className="app">

            <Navbar />

            <div className="dashboard-layout">

                <Sidebar />

                <main className="main-content">

                    <div className="container-fluid">

                        <h2 className="mb-4">
                            {title}
                        </h2>

                        {children}

                    </div>

                </main>

            </div>

            <Footer />

        </div>

    );

}

export default DashboardLayout;
import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import api from "../services/api";

function Billing() {

    const [billingList, setBillingList] = useState([]);
    const [institutionList, setInstitutionList] = useState([]);

    useEffect(() => {
        fetchBillingData();
    }, []);

    const fetchBillingData = async () => {

        try {

            const billingRes = await api.get("/billing");
            const institutionRes = await api.get("/institution");

            setBillingList(billingRes.data);
            setInstitutionList(institutionRes.data);

        } catch (error) {

            console.log(error);

        }

    };
    const markAsPaid = async (billingId) => {

    try {

        const confirmPayment = window.confirm(
            "Are you sure you want to mark this bill as PAID?"
        );

        if (!confirmPayment) {
            return;
        }

        await api.put(
            `/billing/${billingId}/pay`
        );

        alert("Bill marked as PAID successfully.");

        fetchBillingData();

    } catch (error) {

        console.log(error);

        alert("Failed to update billing status.");

    }

};

    const getInstitutionName = (id) => {

        const institution = institutionList.find(
            i => i.institutionId === id
        );

        return institution
            ? institution.institutionName
            : "-";

    };

    return (

        <div style={{ display: "flex" }}>

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "30px"
                }}
            >

                <h1>Lab Resource Utilization Platform</h1>

                <hr />

                <h2>Billing Management</h2>

                {/* Summary Cards */}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(4, 1fr)",
                        gap: "15px",
                        marginTop: "25px",
                        marginBottom: "30px"
                    }}
                >

                    <div
                        style={{
                            backgroundColor: "white",
                            borderLeft: "5px solid #1976d2",
                            borderRadius: "8px",
                            padding: "15px",
                            boxShadow: "0px 3px 8px rgba(0,0,0,0.15)"
                        }}
                    >
                        <h3>Total Bills</h3>

                        <h2>
                            {billingList.length}
                        </h2>

                    </div>


                    <div
                        style={{
                            backgroundColor: "white",
                            borderLeft: "5px solid #d32f2f",
                            borderRadius: "8px",
                            padding: "15px",
                            boxShadow: "0px 3px 8px rgba(0,0,0,0.15)"
                        }}
                    >
                        <h3>Unpaid Bills</h3>

                        <h2>
                            {
                                billingList.filter(
                                    b =>
                                        b.billingStatus === "UNPAID"
                                ).length
                            }
                        </h2>

                    </div>


                    <div
                        style={{
                            backgroundColor: "white",
                            borderLeft: "5px solid #2e7d32",
                            borderRadius: "8px",
                            padding: "15px",
                            boxShadow: "0px 3px 8px rgba(0,0,0,0.15)"
                        }}
                    >
                        <h3>Paid Bills</h3>

                        <h2>
                            {
                                billingList.filter(
                                    b =>
                                        b.billingStatus === "PAID"
                                ).length
                            }
                        </h2>

                    </div>


                    <div
                        style={{
                            backgroundColor: "white",
                            borderLeft: "5px solid #8e24aa",
                            borderRadius: "8px",
                            padding: "15px",
                            boxShadow: "0px 3px 8px rgba(0,0,0,0.15)"
                        }}
                    >
                        <h3>Total Amount</h3>

                        <h2>
                            ₹
                            {
                                billingList
                                    .reduce(
                                        (total, bill) =>
                                            total + (bill.amount || 0),
                                        0
                                    )
                                    .toFixed(2)
                            }
                        </h2>

                    </div>

                </div>


                {/* Billing Table */}

                <h2>Billing Records</h2>

                <table
                    border="1"
                    cellPadding="10"
                    width="100%"
                >

                    <thead>

                        <tr>

                            <th>Bill ID</th>

                            <th>Booking ID</th>

                            <th>From Institution</th>

                            <th>To Institution</th>

                            <th>Amount</th>

                            <th>Status</th>

                            <th>Action</th>

                        </tr>

                    </thead>


                    <tbody>

                        {billingList.map((bill) => (

                            <tr key={bill.billingId}>

                                <td>
                                    {bill.billingId}
                                </td>

                                <td>
                                    {bill.bookingId}
                                </td>

                                <td>
                                    {
                                        getInstitutionName(
                                            bill.fromInstitutionId
                                        )
                                    }
                                </td>

                                <td>
                                    {
                                        getInstitutionName(
                                            bill.toInstitutionId
                                        )
                                    }
                                </td>

                                <td>
                                    ₹{bill.amount}
                                </td>

                                <td>

                                    <span
                                        style={{
                                            backgroundColor:
                                                bill.billingStatus === "PAID"
                                                    ? "green"
                                                    : "orange",

                                            color: "white",

                                            padding: "5px 10px",

                                            borderRadius: "8px",

                                            fontWeight: "bold"
                                        }}
                                    >
                                        {bill.billingStatus}
                                    </span>

                                </td>
                                <td>

    {bill.billingStatus === "UNPAID" && (

        <button
            onClick={() => markAsPaid(bill.billingId)}
        >
            Mark Paid
        </button>

    )}

    {bill.billingStatus === "PAID" && (

        <span
            style={{
                color: "green",
                fontWeight: "bold"
            }}
        >
            ✓ Paid
        </span>

    )}

</td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

}

export default Billing;
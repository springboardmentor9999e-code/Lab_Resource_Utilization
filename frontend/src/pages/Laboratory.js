import React, { useEffect, useState } from "react";
import axios from "axios";

function Laboratory() {

    const [labs, setLabs] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/laboratories")
            .then(res => setLabs(res.data))
            .catch(err => console.log(err));
    }, []);

    return (
        <div className="container mt-4">
            <h2>Laboratories</h2>

            <table className="table table-bordered mt-3">
                <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Laboratory</th>
                    <th>Institution ID</th>
                </tr>
                </thead>

                <tbody>
                {labs.map(lab => (
                    <tr key={lab.labId}>
                        <td>{lab.labId}</td>
                        <td>{lab.labName}</td>
                        <td>{lab.institutionId}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Laboratory;
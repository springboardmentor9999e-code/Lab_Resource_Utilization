import React, { useEffect, useState } from "react";
import axios from "axios";

function Institution() {

    const [institutions, setInstitutions] = useState([]);

    useEffect(() => {
        axios.get("http://localhost:8080/api/institutions")
            .then((response) => {
                setInstitutions(response.data);
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

    return (
        <div className="container mt-4">
            <h2>Institutions</h2>

            <table className="table table-bordered">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Institution Name</th>
                    <th>Address</th>
                </tr>
                </thead>

                <tbody>
                {institutions.map((institution) => (
                    <tr key={institution.institutionId}>
                        <td>{institution.institutionId}</td>
                        <td>{institution.institutionName}</td>
                        <td>{institution.address}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

export default Institution;
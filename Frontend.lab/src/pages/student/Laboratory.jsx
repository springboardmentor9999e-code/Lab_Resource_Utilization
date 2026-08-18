import { useEffect, useState } from "react";
import axios from "axios";

export default function Laboratories() {

    const [labs, setLabs] = useState([]);

    useEffect(() => {
        axios
            .get("http://localhost:8081/api/laboratories")
            .then(res => setLabs(res.data))
            .catch(err => console.log(err));
    }, []);

    return (
        <div className="container mt-4">

            <h2>Laboratory Availability</h2>

            <table className="table table-bordered">

                <thead>

                <tr>
                    <th>Laboratory</th>
                    <th>Total Seats</th>
                    <th>Occupied</th>
                    <th>Available</th>
                    <th>Status</th>
                </tr>

                </thead>

                <tbody>

                {labs.map(lab => (

                    <tr key={lab.id}>

                        <td>{lab.laboratoryName}</td>

                        <td>{lab.totalSeats}</td>

                        <td>{lab.occupiedSeats}</td>

                        <td>{lab.totalSeats - lab.occupiedSeats}</td>

                        <td>

                            {
                                lab.totalSeats - lab.occupiedSeats > 0 ?

                                <span style={{color:"green"}}>

                                    Available

                                </span>

                                :

                                <span style={{color:"red"}}>

                                    Full

                                </span>

                            }

                        </td>

                    </tr>

                ))}

                </tbody>

            </table>

        </div>
    );
}
import React from "react";
import { Link } from "react-router-dom";

import {
    deleteCalibration
} from "../../services/calibrationService";

const CalibrationList = ({ data = [], reload }) => {

    const remove = (id) => {

        if (window.confirm("Delete Calibration?")) {

            deleteCalibration(id)
                .then(() => {

                    alert("Deleted Successfully");

                    reload();

                })
                .catch((err) => {

                    console.log(err);

                });

        }

    };

    return (

        <div className="card">

            <div className="card-body">

                <table className="table table-bordered">

                    <thead className="table-dark">

                        <tr>

                            <th>ID</th>

                            <th>Equipment</th>

                            <th>Calibration Date</th>

                            <th>Next Calibration</th>

                            <th>Status</th>

                            <th>Remarks</th>

                            <th>Actions</th>

                        </tr>

                    </thead>

                    <tbody>

                        {data.length === 0 ? (

                            <tr>

                                <td colSpan="7">

                                    No Calibration Records

                                </td>

                            </tr>

                        ) : (

                            data.map((item) => (

                                <tr key={item.id}>

                                    <td>

                                        {item.id}

                                    </td>

                                    <td>

                                        {item.equipment?.equipmentName}

                                    </td>

                                    <td>

                                        {item.calibrationDate}

                                    </td>

                                    <td>

                                        {item.nextCalibrationDate}

                                    </td>

                                    <td>

                                        {item.status}

                                    </td>

                                    <td>

                                        {item.remarks}

                                    </td>

                                    <td>

                                        <Link
                                            to={`/edit-calibration/${item.id}`}
                                            className="btn btn-warning btn-sm me-2"
                                        >

                                            Edit

                                        </Link>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => remove(item.id)}
                                        >

                                            Delete

                                        </button>

                                    </td>

                                </tr>

                            ))

                        )}

                    </tbody>

                </table>

            </div>

        </div>

    );

};

export default CalibrationList;

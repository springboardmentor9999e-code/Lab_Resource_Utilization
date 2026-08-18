import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getCalibrationById,
    updateCalibration,
    getEquipment
} from "../../services/calibrationService";

const EditCalibration = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const [equipment, setEquipment] = useState([]);

    const [form, setForm] = useState({

        equipmentId: "",

        calibrationDate: "",

        nextCalibrationDate: "",

        remarks: ""

    });

    useEffect(() => {

        getEquipment().then((res) => {

            setEquipment(res.data || []);

        }).catch((err) => console.log(err));

        getCalibrationById(id).then((res) => {

            if (res.data) {
                setForm({

                    equipmentId: res.data.equipment?.id || res.data.equipmentId || "",

                    calibrationDate: res.data.calibrationDate || "",

                    nextCalibrationDate: res.data.nextCalibrationDate || "",

                    remarks: res.data.remarks || ""

                });
            }

        }).catch((err) => console.log(err));

    }, [id]);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const update = (e) => {

        e.preventDefault();

        updateCalibration(id, form)

            .then(() => {

                alert("Calibration Updated Successfully");

                navigate("/calibration");

            })

            .catch((err) => {

                console.log(err);

            });

    };

    return (

        <div className="container mt-4">

            <div className="card">

                <div className="card-header">

                    <h3>Edit Calibration</h3>

                </div>

                <div className="card-body">

                    <form onSubmit={update}>

                        <div className="mb-3">

                            <label className="form-label">Equipment</label>

                            <select
                                className="form-control"
                                name="equipmentId"
                                value={form.equipmentId}
                                onChange={handleChange}
                            >
                                <option value="">Select Equipment</option>

                                {(equipment || []).map((eq) => (

                                    <option
                                        key={eq.id}
                                        value={eq.id}
                                    >
                                        {eq.equipmentName || eq.name}
                                    </option>

                                ))}

                            </select>

                        </div>

                        <div className="mb-3">

                            <label className="form-label">

                                Calibration Date

                            </label>

                            <input
                                type="date"
                                className="form-control"
                                name="calibrationDate"
                                value={form.calibrationDate}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="mb-3">

                            <label className="form-label">

                                Next Calibration Date

                            </label>

                            <input
                                type="date"
                                className="form-control"
                                name="nextCalibrationDate"
                                value={form.nextCalibrationDate}
                                onChange={handleChange}
                            />

                        </div>

                        <div className="mb-3">

                            <label className="form-label">

                                Remarks

                            </label>

                            <textarea
                                className="form-control"
                                rows="3"
                                name="remarks"
                                value={form.remarks}
                                onChange={handleChange}
                            />

                        </div>

                        <button
                            className="btn btn-success"
                            type="submit"
                        >
                            Update Calibration
                        </button>

                    </form>

                </div>

            </div>

        </div>

    );

};

export default EditCalibration;

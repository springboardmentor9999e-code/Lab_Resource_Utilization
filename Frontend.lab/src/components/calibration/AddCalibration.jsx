import React, { useEffect, useState } from "react";

import {
    addCalibration,
    getEquipment
} from "../../services/calibrationService";

const AddCalibration = ({ reload }) => {

    const [equipment, setEquipment] = useState([]);

    const [form, setForm] = useState({

        equipmentId: "",

        calibrationDate: "",

        nextCalibrationDate: "",

        remarks: ""

    });

    useEffect(() => {

        getEquipment()

            .then((res) => {

                setEquipment(res.data || []);

            })

            .catch((err) => {

                console.log(err);

            });

    }, []);

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]: e.target.value

        });

    };

    const saveCalibration = (e) => {

        e.preventDefault();

        if (
            form.equipmentId === "" ||
            form.calibrationDate === "" ||
            form.nextCalibrationDate === ""
        ) {

            alert("Please fill all required fields");

            return;

        }

        addCalibration(form)

            .then(() => {

                alert("Calibration Added Successfully");

                setForm({

                    equipmentId: "",

                    calibrationDate: "",

                    nextCalibrationDate: "",

                    remarks: ""

                });

                reload();

            })

            .catch((err) => {

                console.log(err);

            });

    };

    return (

        <div className="card mb-4">

            <div className="card-header">

                <h4>Add Calibration</h4>

            </div>

            <div className="card-body">

                <form onSubmit={saveCalibration}>

                    <div className="mb-3">

                        <label className="form-label">

                            Equipment

                        </label>

                        <select
                            className="form-control"
                            name="equipmentId"
                            value={form.equipmentId}
                            onChange={handleChange}
                        >

                            <option value="">

                                Select Equipment

                            </option>

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
                            name="calibrationDate"
                            className="form-control"
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
                            name="nextCalibrationDate"
                            className="form-control"
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
                        className="btn btn-primary"
                        type="submit"
                    >

                        Save Calibration

                    </button>

                </form>

            </div>

        </div>

    );

};

export default AddCalibration;

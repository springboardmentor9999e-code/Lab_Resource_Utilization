import React, { useEffect, useState } from "react";

import CalibrationList from "../components/calibration/CalibrationList";
import AddCalibration from "../components/calibration/AddCalibration";
import ExpiryReminder from "../components/calibration/ExpiryReminder";

import {
    getCalibrations
} from "../services/calibrationService";

const CalibrationPage = () => {

    const [calibrations, setCalibrations] = useState([]);

    const loadData = () => {

        getCalibrations()
            .then((res) => {

                setCalibrations(res.data);

            })
            .catch((err) => {

                console.log(err);

            });

    };

    useEffect(() => {

        loadData();

    }, []);

    return (

        <div className="container mt-4">

            <h2 className="mb-4">

                Calibration Management

            </h2>

            <AddCalibration reload={loadData} />

            <ExpiryReminder />

            <CalibrationList
                data={calibrations}
                reload={loadData}
            />

        </div>

    );

};

export default CalibrationPage;

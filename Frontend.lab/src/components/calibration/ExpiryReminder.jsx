import React, { useEffect, useState } from "react";
import { getExpired, getUpcoming } from "../../services/calibrationService";

const ExpiryReminder = () => {

    const [expired, setExpired] = useState([]);
    const [upcoming, setUpcoming] = useState([]);

    useEffect(() => {
        loadReminders();
    }, []);

    const loadReminders = () => {

        getExpired()
            .then((res) => {
                setExpired(res.data || []);
            })
            .catch((err) => {
                console.log(err);
            });

        getUpcoming()
            .then((res) => {
                setUpcoming(res.data || []);
            })
            .catch((err) => {
                console.log(err);
            });

    };

    return (

        <div className="row mt-4 mb-4">

            <div className="col-md-6">

                <div className="card border-danger">

                    <div className="card-header bg-danger text-white">

                        Expired Calibrations

                    </div>

                    <div className="card-body">

                        {(expired || []).length === 0 ? (

                            <p>No Expired Calibrations</p>

                        ) : (

                            <ul className="list-group">

                                {expired.map((item) => (

                                    <li
                                        key={item.id}
                                        className="list-group-item"
                                    >

                                        <strong>
                                            {item.equipment?.equipmentName}
                                        </strong>

                                        <br />

                                        Next Calibration:

                                        {" "}

                                        {item.nextCalibrationDate}

                                    </li>

                                ))}

                            </ul>

                        )}

                    </div>

                </div>

            </div>

            <div className="col-md-6">

                <div className="card border-warning">

                    <div className="card-header bg-warning">

                        Upcoming Calibrations

                    </div>

                    <div className="card-body">

                        {(upcoming || []).length === 0 ? (

                            <p>No Upcoming Calibrations</p>

                        ) : (

                            <ul className="list-group">

                                {upcoming.map((item) => (

                                    <li
                                        key={item.id}
                                        className="list-group-item"
                                    >

                                        <strong>
                                            {item.equipment?.equipmentName}
                                        </strong>

                                        <br />

                                        Next Calibration:

                                        {" "}

                                        {item.nextCalibrationDate}

                                    </li>

                                ))}

                            </ul>

                        )}

                    </div>

                </div>

            </div>

        </div>

    );

};

export default ExpiryReminder;

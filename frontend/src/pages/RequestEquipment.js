import React, { useState } from "react";
import { useLocation } from "react-router-dom";

function RequestEquipment() {

    const location = useLocation();

    const {
        equipmentId,
        equipmentName,
        institutionId,
        institutionName
    } = location.state || {};


    const [form, setForm] = useState({
        bookingDate:"",
        startTime:"",
        endTime:"",
        purpose:""
    });


    const handleChange = (e)=>{
        setForm({
            ...form,
            [e.target.name]:e.target.value
        });
    };


    const submitRequest = (e)=>{
        e.preventDefault();

        console.log({
            equipmentId,
            institutionId,
            ...form
        });

        alert("Request Submitted");
    };


    return (

        <div
            style={{
                marginLeft:"270px",
                padding:"30px"
            }}
        >

            <h2>Request Equipment</h2>


            <div className="card p-4 shadow">

                <h5>
                    Equipment : {equipmentName}
                </h5>
                <p>
                    Institution : {institutionName}
                </p>


                <form onSubmit={submitRequest}>


                    <label>Booking Date</label>
                    <input
                        type="date"
                        name="bookingDate"
                        className="form-control mb-3"
                        onChange={handleChange}
                    />


                    <label>Start Time</label>
                    <input
                        type="time"
                        name="startTime"
                        className="form-control mb-3"
                        onChange={handleChange}
                    />


                    <label>End Time</label>
                    <input
                        type="time"
                        name="endTime"
                        className="form-control mb-3"
                        onChange={handleChange}
                    />


                    <label>Purpose</label>
                    <textarea
                        name="purpose"
                        className="form-control mb-3"
                        onChange={handleChange}
                    />


                    <button className="btn btn-success">
                        Submit Request
                    </button>


                </form>

            </div>

        </div>

    );
}

export default RequestEquipment;
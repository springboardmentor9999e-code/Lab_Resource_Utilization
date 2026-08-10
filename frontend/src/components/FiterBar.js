import React from "react";
import "./FilterBar.css";

function FilterBar() {
    return (
        <div className="filter-container">
            <input type="text" placeholder="Search equipment..." />

            <select>
                <option>All Colleges & Institutions</option>
                <option>MIT</option>
                <option>IIT</option>
                <option>VIT</option>
            </select>



            <select>
                <option>All Statuses</option>
                <option>Available</option>
                <option>Booked</option>
                <option>Booking Pending</option>
                <option>Under Maintenance</option>
            </select>
        </div>
    );
}

export default FilterBar;
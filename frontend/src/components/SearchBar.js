import React from "react";

function SearchBar({ value, onChange }) {

    return (

        <input
            type="text"
            placeholder="Search Equipment..."
            value={value}
            onChange={onChange}
            style={{
                width:"350px",
                padding:"10px",
                marginBottom:"20px"
            }}
        />

    );

}

export default SearchBar;
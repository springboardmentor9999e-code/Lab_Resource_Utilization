import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/inventory.css";

function Inventory() {
    const [equipment, setEquipment] = useState([]);

    useEffect(() => {
        loadInventory();
    }, []);

    const loadInventory = async () => {
        try {
            const response = await axios.get(
                "http://localhost:8080/api/equipment"
            );

            setEquipment(response.data || []);
        } catch (error) {
            console.error("Error loading inventory:", error);
        }
    };

    const totalEquipment = equipment.length;

    const availableEquipment = equipment.filter(
        (item) => item.status === "AVAILABLE"
    ).length;

    const maintenanceEquipment = equipment.filter(
        (item) => item.status === "MAINTENANCE"
    ).length;

    const outOfStockEquipment = equipment.filter(
        (item) => item.status === "OUT_OF_STOCK"
    ).length;

    return (
        <div className="inventory">

            <h2>Equipment Inventory</h2>

            <div className="inventory-cards">

                <div className="inventory-card">
                    <h3>Total Equipment</h3>
                    <h1>{totalEquipment}</h1>
                </div>

                <div className="inventory-card">
                    <h3>Available</h3>
                    <h1>{availableEquipment}</h1>
                </div>

                <div className="inventory-card">
                    <h3>Maintenance</h3>
                    <h1>{maintenanceEquipment}</h1>
                </div>

                <div className="inventory-card">
                    <h3>Out Of Stock</h3>
                    <h1>{outOfStockEquipment}</h1>
                </div>

            </div>

            <table>
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Institution</th>
                    <th>Laboratory</th>
                    <th>Quantity</th>
                    <th>Available</th>
                    <th>Status</th>
                </tr>
                </thead>

                <tbody>
                {equipment.map((item) => (
                    <tr key={item.id}>

                        <td>{item.equipmentName}</td>

                        <td>{item.category}</td>

                        <td>{item.institutionId}</td>

                        <td>{item.laboratoryId}</td>

                        <td>{item.quantity}</td>

                        <td>{item.availableQuantity}</td>

                        <td>{item.status}</td>

                    </tr>
                ))}
                </tbody>
            </table>

        </div>
    );
}

export default Inventory;
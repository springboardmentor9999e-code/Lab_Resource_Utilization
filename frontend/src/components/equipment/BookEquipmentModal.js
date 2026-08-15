import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { addBooking } from "../../services/bookingService";

const BookEquipmentModal = ({ show, handleClose, equipment }) => {
    const role = localStorage.getItem("role");
    const isAdmin = ["SYSTEM_ADMIN", "INSTITUTION_ADMIN"].includes(role);

    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");

    const calculateCost = () => {
        if (!startTime || !endTime || !equipment) return 0;
        
        const [startH, startM] = startTime.split(":").map(Number);
        const [endH, endM] = endTime.split(":").map(Number);
        
        const durationHrs = (endH * 60 + endM - (startH * 60 + startM)) / 60;
        if (durationHrs <= 0) return 0;
        
        // Students and Researchers never pay external utilization fees (Institutional Covered)
        if (role === "STUDENT" || role === "RESEARCHER") {
            return 0;
        }

        const userInstId = localStorage.getItem("institutionId");
        const eqInstId = equipment.laboratory?.department?.institution?.institutionId;
        
        if (userInstId && eqInstId && userInstId.toString() === eqInstId.toString()) {
            return 0;
        } else {
            const rate = (equipment.costPerHour && equipment.costPerHour > 0) ? equipment.costPerHour : 5.0;
            return durationHrs * rate;
        }
    };

    const handleBooking = async () => {
        const confirmed = window.confirm("Are you sure you want to book this equipment?");
        if (!confirmed) {
            return;
        }
        try {
            const userId = localStorage.getItem("userId");
            const booking = {
                equipment: {
                    id: equipment.id
                },
                user: {
                    userId: Number(userId)
                },
                bookingDate,
                startTime,
                endTime,
                purpose,
                status: "PENDING"
            };

            await addBooking(booking);
            alert("Booking request submitted successfully.");
            handleClose();
        } catch (error) {
            console.error(error);
            alert("Booking request failed.");
        }
    };

    const isOwnInstitute = localStorage.getItem("institutionId")?.toString() === equipment?.laboratory?.department?.institution?.institutionId?.toString();

    return (
        <Modal
            show={show}
            onHide={handleClose}
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title>
                    Book Equipment
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>
                            Equipment
                        </Form.Label>
                        <Form.Control
                            value={equipment?.equipmentName || ""}
                            readOnly
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Booking Date
                        </Form.Label>
                        <Form.Control
                            type="date"
                            value={bookingDate}
                            onChange={(e) =>
                                setBookingDate(e.target.value)
                            }
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Start Time
                        </Form.Label>
                        <Form.Control
                            type="time"
                            value={startTime}
                            onChange={(e) =>
                                setStartTime(e.target.value)
                            }
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            End Time
                        </Form.Label>
                        <Form.Control
                            type="time"
                            value={endTime}
                            onChange={(e) =>
                                setEndTime(e.target.value)
                            }
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>
                            Purpose
                        </Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={purpose}
                            onChange={(e) =>
                                setPurpose(e.target.value)
                            }
                        />
                    </Form.Group>

                    <div className="p-3 bg-light rounded border">
                        {isAdmin && (
                            <>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-bold text-muted small">Owning Institute:</span>
                                    <span className="small fw-semibold text-end">{equipment?.laboratory?.department?.institution?.institutionName || "N/A"}</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center mt-1">
                                    <span className="fw-bold text-muted small">Billing Rate:</span>
                                    <span className="small fw-semibold">
                                        {isOwnInstitute ? "₹0.00/hr (Internal)" : `₹${(equipment?.costPerHour && equipment?.costPerHour > 0 ? equipment.costPerHour : 5.0).toFixed(2)}/hr (External)`}
                                    </span>
                                </div>
                                <hr className="my-2" />
                            </>
                        )}
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-bold">Estimated Cost:</span>
                            <span className="fw-bold text-success" style={{ fontSize: "1.2rem" }}>
                                ₹{calculateCost().toFixed(2)}
                            </span>
                        </div>
                    </div>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                >
                    Cancel
                </Button>
                <Button
                    variant="success"
                    onClick={handleBooking}
                    disabled={!bookingDate || !startTime || !endTime}
                >
                    Confirm Booking
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BookEquipmentModal;
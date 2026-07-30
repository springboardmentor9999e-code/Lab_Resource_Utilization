import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { addBooking } from "../../services/bookingService";

const BookEquipmentModal = ({ show, handleClose, equipment }) => {

    const [bookingDate, setBookingDate] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [purpose, setPurpose] = useState("");

    const handleBooking = async () => {

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

            alert("Booking created successfully.");

            handleClose();

        } catch (error) {

            console.error(error);

            alert("Booking failed.");

        }

    };

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

                    <Form.Group>

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
                >
                    Confirm Booking
                </Button>

            </Modal.Footer>

        </Modal>

    );

};

export default BookEquipmentModal;
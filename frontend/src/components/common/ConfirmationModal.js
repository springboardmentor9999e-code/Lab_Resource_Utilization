import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaQuestionCircle } from "react-icons/fa";

function ConfirmationModal({ show, title, message, onConfirm, onCancel }) {
    return (
        <Modal show={show} onHide={onCancel} centered backdrop="static" keyboard={false} className="shadow">
            <Modal.Header closeButton className="bg-primary text-white border-0">
                <Modal.Title className="fw-bold d-flex align-items-center gap-2">
                    <FaQuestionCircle /> {title || "Confirm Action"}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className="py-4 px-4 text-center">
                <h5 className="text-dark mb-0 fw-semibold">{message || "Are you sure you want to proceed?"}</h5>
            </Modal.Body>
            <Modal.Footer className="border-0 justify-content-center pb-4">
                <Button variant="outline-secondary" className="px-4" onClick={onCancel}>
                    Cancel
                </Button>
                <Button variant="primary" className="px-4" onClick={onConfirm}>
                    Confirm / OK
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default ConfirmationModal;

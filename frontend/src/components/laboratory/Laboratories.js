import React, { useEffect, useState } from "react";
import { Row, Col, Card, Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaLaptop, FaFlask } from "react-icons/fa";
import DashboardLayout from "../dashboard/DashboardLayout";
import { getAllLaboratories } from "../../services/laboratoryService";

function Laboratories() {
    const navigate = useNavigate();
    const [laboratories, setLaboratories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadLaboratories();
    }, []);

    const loadLaboratories = async () => {
        try {
            const response = await getAllLaboratories();
            setLaboratories(response.data);
        } catch (err) {
            console.error(err);
            setError("Unable to load laboratories.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Laboratory Catalog">
            <Container fluid className="px-0">
                <Card className="shadow border-0 mb-4">
                    <Card.Body>
                        <p className="text-muted mb-0">
                            Explore available laboratories in your institution and navigate to their inventory list.
                        </p>
                    </Card.Body>
                </Card>

                {loading ? (
                    <h5 className="text-center text-muted py-5">Loading laboratories directory...</h5>
                ) : error ? (
                    <div className="alert alert-danger text-center">{error}</div>
                ) : laboratories.length === 0 ? (
                    <h5 className="text-center text-muted py-5">No laboratories registered in the system.</h5>
                ) : (
                    <Row className="g-4">
                        {laboratories.map((lab) => (
                            <Col lg={4} md={6} key={lab.labId}>
                                <Card className="shadow h-100">
                                    <Card.Body className="d-flex flex-column justify-content-between">
                                        <div>
                                            <div className="d-flex align-items-center mb-3">
                                                <FaFlask size={28} className="text-primary me-3" />
                                                <h5 className="fw-bold mb-0 text-primary">{lab.labName}</h5>
                                            </div>
                                            <hr className="my-2" style={{ borderColor: "rgba(0,0,0,0.08)" }} />
                                            <Card.Text className="small text-muted mb-3">
                                                <strong>Department:</strong> {lab.department ? lab.department.departmentName : "N/A"}
                                                <br />
                                                <strong>Location:</strong> {lab.location || "Main Campus"}
                                                <br />
                                                <strong>Description:</strong> {lab.description || "No description provided."}
                                            </Card.Text>
                                        </div>
                                        <Button
                                            variant="primary"
                                            className="w-100 mt-3"
                                            onClick={() => navigate("/equipment")}
                                        >
                                            <FaLaptop className="me-2" /> View Equipment
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </DashboardLayout>
    );
}

export default Laboratories;
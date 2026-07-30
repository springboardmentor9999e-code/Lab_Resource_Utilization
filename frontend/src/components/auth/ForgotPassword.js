import { useState } from "react";

import {
    BsEnvelopeFill,
    BsArrowLeft
} from "react-icons/bs";

function ForgotPassword({ onBack }) {

    const [email, setEmail] = useState("");

    const handleSubmit = (e) => {

        e.preventDefault();

        if (email.trim() === "") {

            alert("Please enter your registered email.");

            return;

        }

        // Backend API later
        alert(
            "OTP will be sent to your email.\n\n(Backend will be connected in next step.)"
        );

    };

    return (

        <>

            <h2 className="fw-bold mb-2">
                Forgot Password
            </h2>

            <p className="text-muted mb-4">

                Enter your registered email address.
                We'll send you a One-Time Password (OTP).

            </p>

            <form onSubmit={handleSubmit}>

                <div className="mb-4">

                    <label className="form-label">

                        Email Address

                    </label>

                    <div className="input-group">

                        <span className="input-group-text">

                            <BsEnvelopeFill />

                        </span>

                        <input
                            type="email"
                            className="form-control"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            required
                        />

                    </div>

                </div>

                <button
                    type="submit"
                    className="login-btn mb-3"
                >
                    Send OTP
                </button>

                <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={onBack}
                >
                    <BsArrowLeft className="me-2" />

                    Back to Login

                </button>

            </form>

        </>

    );

}

export default ForgotPassword;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/login.css";


function Login() {


    const navigate = useNavigate();


    const [user, setUser] = useState({

        email: "",
        password: ""

    });


    const [error, setError] = useState("");



    const handleChange = (e) => {

        setUser({

            ...user,
            [e.target.name]: e.target.value

        });

    };



    const handleLogin = async (e) => {

        e.preventDefault();


        try {


            const response = await axios.post(

                "http://localhost:8080/api/auth/login",

                user

            );


            console.log(
                "Login Response:",
                response.data
            );



            // Store complete user data

            localStorage.setItem(

                "user",

                JSON.stringify(response.data)

            );



            // Store individual values

            localStorage.setItem(

                "token",

                response.data.token

            );


            localStorage.setItem(

                "role",

                response.data.role

            );


            localStorage.setItem(

                "name",

                response.data.name

            );


            localStorage.setItem(

                "userId",

                response.data.userId

            );



            navigate("/dashboard");



        } catch (error) {


            console.log(
                "Login Error:",
                error
            );


            setError(
                "Invalid email or password"
            );


        }

    };




    return (


        <div className="login-page">



            <div className="background-animation">

                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <span></span>

            </div>




            <header className="top-header">


                <div className="brand">


                    <div className="brand-icon">

                        🔬

                    </div>


                    <div>

                        <h1>
                            Lab Resource
                        </h1>


                        <p>
                            Utilization Platform
                        </p>


                    </div>


                </div>


            </header>





            <main className="login-container">


                <div className="welcome-section">


                    <div className="welcome-icon">

                        🧪

                    </div>


                    <h2>
                        Welcome Back!
                    </h2>


                    <p>
                        Manage laboratory resources smarter
                    </p>



                    <div className="features">


                        <span>
                            🔬 Smart Resource Management
                        </span>


                        <span>
                            📅 Easy Booking
                        </span>


                        <span>
                            📊 Better Utilization
                        </span>


                    </div>


                </div>





                <div className="login-card">


                    <div className="login-header">


                        <div className="login-icon">

                            🔐

                        </div>


                        <h2>
                            Login
                        </h2>


                        <p>
                            Access your laboratory dashboard
                        </p>


                    </div>





                    {
                        error &&

                        <div className="error-message">

                            {error}

                        </div>

                    }





                    <form onSubmit={handleLogin}>



                        <div className="input-group">


                            <label>
                                Email Address
                            </label>


                            <div className="input-wrapper">


                                <span>
                                    📧
                                </span>


                                <input


                                    type="email"


                                    name="email"


                                    placeholder="Enter your email"


                                    value={user.email}


                                    onChange={handleChange}


                                    required


                                />


                            </div>


                        </div>





                        <div className="input-group">


                            <label>
                                Password
                            </label>


                            <div className="input-wrapper">


                                <span>
                                    🔒
                                </span>


                                <input


                                    type="password"


                                    name="password"


                                    placeholder="Enter your password"


                                    value={user.password}


                                    onChange={handleChange}


                                    required


                                />


                            </div>


                        </div>





                        <button

                            type="submit"

                            className="login-button"

                        >

                            Login

                            <span>
                                →
                            </span>


                        </button>




                    </form>





                    <div className="register-section">


                        <p>
                            Don't have an account?
                        </p>


                        <Link

                            to="/register"

                            className="register-button"

                        >

                            Create Account


                        </Link>


                    </div>




                </div>



            </main>





            <footer>

                © 2026 Lab Resource Utilization Platform

            </footer>



        </div>


    );

}


export default Login;
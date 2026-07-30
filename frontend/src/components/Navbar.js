import "../App.css";
import { FaBell, FaSearch, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Navbar() {

  const fullName = localStorage.getItem("fullName");
  const role = localStorage.getItem("role");

  

    const navigate = useNavigate();

    const handleLogout = () => {

        localStorage.clear();

        navigate("/");

    };

  return (
    <header className="navbar">

      <div className="navbar-left">
        <h2>Lab Resource Utilization Platform</h2>
      </div>

      <div className="navbar-center">

        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Search..."
          />
        </div>

      </div>

      <div className="navbar-right">

        <button className="notification-btn">
          <FaBell />
        </button>

        <div className="user-info">

          <FaUserCircle className="user-icon" />

          <div>

            <strong>{fullName}</strong>

            <br />

            <small>{role}</small>

          </div>

        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;
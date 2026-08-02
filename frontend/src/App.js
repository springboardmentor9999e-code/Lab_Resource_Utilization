import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import Equipment from "./pages/Equipment";
import Booking from "./pages/Booking";
import Institution from "./pages/Institution";
import DepartmentList from "./pages/DepartmentList";
import AddDepartment from "./pages/AddDepartment";
import EditDepartment from "./pages/EditDepartment";
import Category from "./pages/Category";

function App() {

    return (

        <BrowserRouter>

            <Routes>

                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                   path="/equipment"
                   element={
                        <ProtectedRoute>
                            <Equipment />
                        </ProtectedRoute>
                    }
                />
                <Route
    path="/booking"
    element={
        <ProtectedRoute>
            <Booking />
        </ProtectedRoute>
    }
/>
<Route
    path="/institution"
    element={
        <ProtectedRoute>
            <Institution />
        </ProtectedRoute>
    }
/>
<Route 
path="/department"
 element={
 <DepartmentList />} />
 <Route path="/department/add" element={<AddDepartment />} />
 <Route
    path="/department/edit/:id"
    element={<EditDepartment />}
/>
<Route
    path="/category"
    element={
        <ProtectedRoute>
            <Category />
        </ProtectedRoute>
    }
/>
            </Routes>

        </BrowserRouter>

    );

}

export default App;
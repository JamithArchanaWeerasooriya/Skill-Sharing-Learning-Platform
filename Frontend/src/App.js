import React, { useEffect } from "react";
import { Route, Routes, Navigate } from "react-router";
import { useNavigate } from "react-router-dom";
import UserLogin from "./Pages/UserManagement/UserLogin";
import UserRegister from "./Pages/UserManagement/UserRegister";


function ProtectedRoute({ children }) {
  const userID = localStorage.getItem("userID");
  if (!userID) {
    return <Navigate to="/" />;
  }
  return children;
}

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.pathname === "/oauth2/success") {
      const params = new URLSearchParams(window.location.search);
      const userID = params.get("userID");
      const name = params.get("name");

      if (userID && name) {
        localStorage.setItem("userID", userID);
        alert(`Login successful! Welcome, ${name}`);
        localStorage.setItem("userType", "googale");
        navigate("/learningSystem/AllPost");
      } else {
        alert("Login failed. Missing user information.");
      }
    }
  }, [navigate]);

  return (
    <div>
      <React.Fragment>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />

          {/* Protected Routes */}

          <Route
            path="/addNewPost"
            element={
              <ProtectedRoute>
                <AddNewPost />
              </ProtectedRoute>
            }
          />
          
        </Routes>
      </React.Fragment>
    </div>
  );
}

export default App;

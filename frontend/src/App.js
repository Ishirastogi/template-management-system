import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar"; // Import Navbar
import Home from "./components/Home";
import TemplateForm from "./components/TemplateForm"; // Import TemplateForm
import TemplateList from "./components/TemplateList";
import { Navigate } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import FormStatus from "./components/FormStatus";

const PrivateRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();
  return user && allowedRoles.includes(user.role) ? (
    element
  ) : (
    <Navigate to="/login" />
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <Routes>
          {/* Route for TemplateForm */}
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/home"
            element={
              <PrivateRoute
                element={<Home />}
                allowedRoles={["admin", "manager"]}
              />
            }
          />
          <Route
            path="/templateform"
            element={
              <PrivateRoute
                element={<TemplateForm />}
                allowedRoles={["user", "admin", "manager"]}
              />
            }
          />
          <Route
            path="/templatelist"
            element={
              <PrivateRoute
                element={<TemplateList />}
                allowedRoles={["manager", "admin"]}
              />
            }
          />

<Route
            path="/FormStatus"
            element={
              <PrivateRoute
                element={<FormStatus />}
                allowedRoles={["manager", "admin", "user"]}
              />
            }
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

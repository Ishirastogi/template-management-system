import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // ✅ Load user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // ✅ Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);
  const login = (username, password) => {
    // Define user credentials
    const credentials = {
      manager123: { password: "managerPass", role: "admin" },
      admin123: { password: "adminPass", role: "admin" },
      user123: { password: "userPass", role: "admin" },
    };

    // Check if username exists and password matches
    if (credentials[username] && credentials[username].password === password) {
      const userRole = credentials[username].role;
      setUser({ username, role: userRole });
      console.log("User logged in:", username, "Role:", userRole); // Debugging line

      //     // Redirect based on role
      //     if (userRole === "admin") {
      //       navigate("/home");
      //     } else if (userRole === "manager") {
      //       navigate("/templatelist");
      //     } else {
      //       navigate("/templateform");
      //     }
      //   } else {
      //     alert("Invalid credentials");
      //   }
      // };
      // Redirect all users to /home
      navigate("/home");
    } else {
      alert("Invalid credentials");
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user"); // ✅ Remove from localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

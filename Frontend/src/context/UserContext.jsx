import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { authAPI } from "../services/api";
import { disconnectSocket } from "../services/socket";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const saved = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");

    if (token && saved) {
      try {
        setUser(JSON.parse(saved));
        setRole(savedRole || JSON.parse(saved).role || "patient");
        setIsLoggedIn(true);

        authAPI
          .me()
          .then((d) => {
            const freshUser = d.user || d.patient || d.doctor;
            if (freshUser) {
              setUser(freshUser);
              const r = freshUser.role || savedRole || "patient";
              setRole(r);
              localStorage.setItem("user", JSON.stringify(freshUser));
              localStorage.setItem("role", r);
            }
          })
          .catch(() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            setUser(null);
            setRole(null);
            setIsLoggedIn(false);
          })
          .finally(() => setLoading(false));
      } catch {
        localStorage.clear();
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token, userRole) => {
    disconnectSocket();
    setUser(userData);
    setRole(userRole);
    setIsLoggedIn(true);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("role", userRole);
  };

  const logout = () => {
    disconnectSocket();
    setUser(null);
    setRole(null);
    setIsLoggedIn(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider
      value={{
        user,
        role,
        isLoggedIn,
        loading,
        login,
        logout,
        updateUser,
        setUser,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

import { useState, useEffect } from "react";
import { Cookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

export interface AuthState {
  isLoggedIn: boolean;
  username: string;
}

export const useAuth = () => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    username: "",
  });

  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      const username = localStorage.getItem("username") || "";
      setAuthState({ isLoggedIn, username });
    };

    checkAuthStatus();

    // Listen for storage changes (useful for multiple tabs)
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  const login = (username: string) => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    setAuthState({ isLoggedIn: true, username });
  };

  const logout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("authToken");
    localStorage.removeItem("access_token");

    const cookies = new Cookies();
    cookies.remove("access_token", { path: "/" });
    setAuthState({ isLoggedIn: false, username: "" });

    // Redirect to home and replace history to prevent going back
    navigate("/", { replace: true });
  };

  return {
    ...authState,
    login,
    logout,
    setAuthState, // Expose for external updates if needed
  };
};
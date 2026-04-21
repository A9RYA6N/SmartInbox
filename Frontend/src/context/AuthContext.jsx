import { createContext, useContext, useState, useEffect } from "react";
import { axiosClient } from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("authTokens");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTokens(parsed);
        axiosClient.defaults.headers.common["Authorization"] = `Bearer ${parsed.access_token}`;
        fetchProfile(parsed.role);
      } catch {
        logout();
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get("/auth/me");
      setUser(res.data);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (newTokens) => {
    localStorage.setItem("authTokens", JSON.stringify(newTokens));
    setTokens(newTokens);
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${newTokens.access_token}`;
    setIsLoading(true);
    setUser({ role: newTokens.role });
    await fetchProfile(newTokens.role);
  };

  const logout = () => {
    localStorage.removeItem("authTokens");
    setTokens(null);
    setUser(null);
    delete axiosClient.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, tokens, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

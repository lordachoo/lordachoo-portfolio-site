import { useState, useEffect } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: 'include', // Include session cookies
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    setIsAuthenticated(false);
    window.location.href = "/";
  };

  return {
    isAuthenticated,
    isLoading,
    logout,
  };
}
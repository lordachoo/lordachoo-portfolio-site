import { useQuery, useQueryClient } from "@tanstack/react-query";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: authData, isLoading } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const response = await fetch("/api/auth/me", {
        credentials: 'include',
      });
      
      if (!response.ok) {
        return { isAuthenticated: false, user: null };
      }
      
      const data = await response.json();
      return { isAuthenticated: true, user: data.user };
    },
    retry: false,
    refetchInterval: 30000, // Check every 30 seconds
  });

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
    
    // Update auth state immediately
    queryClient.setQueryData(["/api/auth/me"], { isAuthenticated: false, user: null });
    window.location.href = "/";
  };

  return {
    user: authData?.user || null,
    isLoading,
    isAuthenticated: authData?.isAuthenticated || false,
    logout,
  };
}
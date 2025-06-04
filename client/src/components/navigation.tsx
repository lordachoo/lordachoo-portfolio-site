import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { Moon, Sun, Menu, X, Settings, LogOut } from "lucide-react";
import type { NavigationItem, Profile } from "@shared/schema";

interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [location] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, logout, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Show logout button on admin page or when authenticated
  const showLogoutButton = isAuthenticated || location.includes('/admin');

  const { data: navigationItems = [] } = useQuery<NavigationItem[]>({
    queryKey: ["/api/navigation"],
  });

  // Filter navigation items to only show visible ones for public users
  // Show all items (including hidden) only on admin page, otherwise filter by visibility
  const isAdminPage = location.includes('/admin');
  const visibleNavigationItems = isAdminPage 
    ? navigationItems 
    : navigationItems.filter(item => item.isVisible);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  const isActiveRoute = (href: string) => {
    if (href === "/" || href === "#home") return location === "/";
    return location.startsWith(href.replace("#", "/"));
  };

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 h-full w-60 bg-card border-r border-border z-40 transition-transform duration-300 ease-in-out overflow-y-auto",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Profile Section */}
          <div className="p-6 border-b border-border">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage src={profile?.avatarUrl || undefined} alt={profile?.name} />
                <AvatarFallback>
                  {profile?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="text-center">
                <h2 className="text-lg font-semibold">
                  {profile?.name || "Your Name"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {profile?.title || "Software Engineer"}
                </p>
              </div>
              
              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="w-full"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {visibleNavigationItems.map((item) => {
              const isExternal = item.href.startsWith('http') || item.href.startsWith('www');
              const isHashLink = item.href.startsWith("#");
              const href = isHashLink ? item.href.replace("#", "/") : item.href;
              const isActive = isActiveRoute(item.href);
              
              const handleClick = (e: React.MouseEvent) => {
                if (isHashLink) {
                  e.preventDefault();
                  const targetId = item.href.substring(1);
                  const element = document.getElementById(targetId);
                  if (element) {
                    element.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    });
                  }
                }
              };
              
              if (isExternal) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "sidebar-item flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                      "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    )}
                  >
                    <i className={`${item.icon} w-5 h-5`} />
                    <span>{item.label}</span>
                  </a>
                );
              }
              
              return (
                <Link key={item.id} href={href === "/home" ? "/" : href}>
                  <div
                    className={cn(
                      "sidebar-item flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    )}
                    onClick={handleClick}
                  >
                    <i className={`${item.icon} w-5 h-5`} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Admin Access */}
          <div className="p-4 border-t border-border space-y-2">
            <Link href="/admin">
              <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors cursor-pointer">
                <Settings className="w-5 h-5" />
                <span>Admin Panel</span>
              </div>
            </Link>
            
            {showLogoutButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </Button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

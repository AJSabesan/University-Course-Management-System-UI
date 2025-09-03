import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, LayoutDashboard, BookOpen, Users, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface AdminNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AdminNavigation = ({ activeTab, setActiveTab }: AdminNavigationProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "courses", label: "Courses", icon: BookOpen },
    { id: "students", label: "Students", icon: Users },
    { id: "results", label: "Results", icon: Trophy },
  ];

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/admin/dashboard" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8" />
              <span className="font-bold text-lg">University CMS</span>
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "flex items-center space-x-2 px-3 py-2 rounded-md text-sm transition-colors",
                      activeTab === item.id
                        ? "bg-primary-hover text-white"
                        : "hover:bg-primary-hover/50 text-primary-foreground/80"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-primary-foreground/80">Welcome, {user?.name || 'Admin'}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="text-primary-foreground hover:bg-primary-hover"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-primary-hover/20">
        <div className="flex overflow-x-auto px-4 py-2 space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "flex items-center space-x-1 px-3 py-2 rounded-md text-xs whitespace-nowrap transition-colors",
                  activeTab === item.id
                    ? "bg-primary-hover text-white"
                    : "hover:bg-primary-hover/50 text-primary-foreground/80"
                )}
              >
                <Icon className="h-3 w-3" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
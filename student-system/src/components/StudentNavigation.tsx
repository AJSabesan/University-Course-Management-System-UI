import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const StudentNavigation = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link to="/student/dashboard" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8" />
              <span className="font-bold text-lg">University CMS</span>
            </Link>
            
            <div className="hidden md:flex space-x-6">
              <Link 
                to="/student/dashboard" 
                className="hover:text-primary-foreground/80 transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-primary-foreground/60">•</span>
              <span className="text-primary-foreground/80">Student Portal</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm text-primary-foreground/80">Welcome, {user?.name || 'Student'}</span>
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
    </nav>
  );
};
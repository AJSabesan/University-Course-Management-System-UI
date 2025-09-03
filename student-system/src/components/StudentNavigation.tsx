import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, BookOpen, ChevronLeft, ChevronRight, Clock, UserCircle2, LayoutDashboard, Users, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface StudentNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setIsExpanded: (isExpanded: boolean) => void;
}

export const StudentNavigation = ({ activeTab, setActiveTab, setIsExpanded }: StudentNavigationProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isExpandedState, setIsExpandedState] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const toggleSidebar = () => {
    setIsExpandedState(prevState => {
      const newState = !prevState;
      setIsExpanded(newState);
      return newState;
    });
  };

  const navItems = [
    { id: "courses", label: "Available Courses", icon: BookOpen },
    { id: "my-courses", label: "My Courses", icon: LayoutDashboard }, // Using LayoutDashboard for My Courses as a placeholder
    { id: "results", label: "Academic Results", icon: Trophy },
    { id: "profile", label: "Profile", icon: UserCircle2 },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-full bg-gradient-to-b from-university-blue to-university-teal text-white shadow-lg flex flex-col transition-all duration-300 z-50",
      isExpandedState ? "w-64" : "w-20"
    )}>
      <div className="flex items-center justify-center h-16 border-b border-primary-hover/20 relative">
        <Link to="/student/dashboard" className={cn("flex items-center space-x-2", isExpandedState ? "pr-4" : "")}>
          <GraduationCap className="h-8 w-8 min-w-[2rem]" />
          {isExpandedState && <span className="font-bold text-xl whitespace-nowrap">CourseFlow</span>}
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-primary-hover/70 hover:bg-primary-hover border border-primary-hover/30 rounded-full h-7 w-7 transition-all duration-300"
        >
          {isExpandedState ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {isExpandedState && (
        <div className="flex flex-col items-center p-4 border-b border-primary-hover/20">
          <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-university-blue text-5xl font-bold mb-3">
            <UserCircle2 className="h-16 w-16 text-gray-700" />
          </div>
          <p className="text-lg font-semibold text-white whitespace-nowrap">Welcome, {user?.name || 'Student'}</p>
          <div className="flex items-center space-x-2 text-sm text-gray-200">
            <Clock className="h-4 w-4" />
            <span>{formattedTime}, {formattedDate}</span>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center px-4 py-3 rounded-md text-base transition-colors duration-200 group mx-2",
                activeTab === item.id
                  ? "bg-primary-hover text-white font-semibold"
                  : "hover:bg-primary-hover/50 text-primary-foreground/80 hover:text-white",
                isExpandedState ? "justify-start space-x-3" : "justify-center space-x-0"
              )}
            >
              <Icon className={cn("h-6 w-6", isExpandedState ? "" : "min-w-[1.5rem]")} />
              {isExpandedState && <span className="whitespace-nowrap text-lg">{item.label}</span>}
            </button>
          );
        })}
      </div>

      <div className="border-t border-primary-hover/20 p-4">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center transition-colors duration-200 text-base",
            isExpandedState ? "justify-start space-x-3 px-3" : "justify-center space-x-0"
          )}
        >
          <LogOut className={cn("h-6 w-6", isExpandedState ? "" : "min-w-[1.5rem]")} />
          {isExpandedState && <span className="whitespace-nowrap text-lg">Logout</span>}
        </Button>
      </div>
    </aside>
  );
};
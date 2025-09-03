import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Users, Award } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users to their appropriate dashboard
      if (user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (user.role === 'STUDENT') {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-animated-gradient">
      {/* Hero Section */}
      <div className="relative overflow-hidden py-20 md:py-32">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          {/* Left Content */}
          <div className="text-white text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-6">
              <GraduationCap className="h-16 w-16 text-white/90" />
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold mb-4 font-heading leading-tight">
              Your Future, <br className="hidden md:inline"/>Simplified. 
              Manage Academics Effortlessly.
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 max-w-md md:max-w-none">
              Unlock your academic potential. Our platform simplifies course management,
              helps you monitor your grades, and keeps your educational journey organized and rewarding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link to="/login">Get Started</Link>
              </Button>
              <Button 
                asChild 
                size="lg" 
                variant="secondary"
                className="bg-white text-primary hover:bg-white/90 px-8 py-3 text-lg font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link to="/login">Log In</Link>
              </Button>
            </div>
          </div>
          {/* Right Image/Illustration */}
          <div className="mt-12 md:mt-0 flex justify-center items-center">
            {/* Placeholder for a relevant illustration or image */}
            <img 
              src="/academic-success.png" 
              alt="Academic Illustration" 
              className="max-w-full h-auto rounded-lg shadow-2xl transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4 text-gray-900">
              Comprehensive Tools for Your Academic Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our platform is designed to provide everything you need for academic success, 
              from managing your courses to tracking your achievements.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-primary rounded-lg bg-gradient-to-br from-[var(--card-gradient-start)] to-[var(--card-gradient-end-primary)]">
              <div className="absolute inset-0 bg-pattern-light opacity-[var(--pattern-light-opacity)] group-hover:opacity-[calc(var(--pattern-light-opacity)*2)] transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    <BookOpen className="h-14 w-14 text-primary group-hover:text-primary-dark transition-colors duration-300" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-primary transition-colors duration-300">Course Management</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-gray-700 text-base leading-relaxed">
                  Effortlessly browse, register, and manage your courses. Get detailed information, 
                  prerequisites, and schedules at your fingertips.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-accent rounded-lg bg-gradient-to-br from-[var(--card-gradient-start)] to-[var(--card-gradient-end-accent)]">
              <div className="absolute inset-0 bg-pattern-light opacity-[var(--pattern-light-opacity)] group-hover:opacity-[calc(var(--pattern-light-opacity)*2)] transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors duration-300">
                    <Award className="h-14 w-14 text-accent group-hover:text-accent-dark transition-colors duration-300" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-accent transition-colors duration-300">Results & Grades</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-gray-700 text-base leading-relaxed">
                  Track your academic progress with real-time grade updates, comprehensive 
                  result analytics, and a clear overview of your achievements.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-t-4 border-university-warning rounded-lg bg-gradient-to-br from-[var(--card-gradient-start)] to-[var(--card-gradient-end-warning)]">
              <div className="absolute inset-0 bg-pattern-light opacity-[var(--pattern-light-opacity)] group-hover:opacity-[calc(var(--pattern-light-opacity)*2)] transition-opacity duration-300"></div>
              <CardHeader className="text-center pb-4 relative z-10">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-university-warning/10 group-hover:bg-university-warning/20 transition-colors duration-300">
                    <Users className="h-14 w-14 text-university-warning group-hover:text-university-warning-dark transition-colors duration-300" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-university-warning transition-colors duration-300">Admin Dashboard</CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <CardDescription className="text-center text-gray-700 text-base leading-relaxed">
                  Powerful administrative tools for managing students, courses, and 
                  academic records with efficiency and precision.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-primary to-accent text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Transform Your Academic Experience?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto">
            Join our growing community and take control of your educational journey today. 
            Sign up now to access all features.
          </p>
          <Button 
            asChild 
            size="lg" 
            variant="secondary"
            className="bg-white text-primary hover:bg-white/90 px-10 py-4 text-xl font-semibold shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <Link to="/login">Log In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
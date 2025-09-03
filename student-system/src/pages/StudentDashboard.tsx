import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, GraduationCap, Trophy, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StudentNavigation } from "@/components/StudentNavigation";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type Student = { id: number; name: string; email: string; studentNumber: string };
type Course = { id: number; code: string; title: string; credits: number; instructor: string };
type Registration = { id: number; student: Student; course: Course; registrationDate: string };
type ResultItem = { id: number; studentNumber: string; courseCode: string; courseName: string; grade: string };

const baseUrl = import.meta.env.VITE_API_URL;

const StudentDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [selectedStudentNumber, setSelectedStudentNumber] = useState("");
  const { toast } = useToast();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("courses");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Fetch data
  const fetchStudents = async () => {
    const res = await api.get(`${baseUrl}/api/students`);
    setStudents(res.data);
  };
  const fetchCourses = async () => {
    const res = await api.get(`${baseUrl}/api/courses`);
    setCourses(res.data);
  };
  const fetchRegistrations = async () => {
    const res = await api.get(`${baseUrl}/api/registrations`);
    setRegistrations(res.data);
  };
  const fetchResults = async () => {
    const res = await api.get(`${baseUrl}/api/results`);
    setResults(res.data);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchStudents(), fetchCourses(), fetchRegistrations(), fetchResults()]);
      } catch (e) {
        toast({ title: "Error", description: "Failed to load data.", variant: "destructive" });
      }
    };
    init();
  }, [toast]);

  // Load studentNumber from user context or localStorage
  useEffect(() => {
    if (user?.studentNumber) {
      setSelectedStudentNumber(user.studentNumber);
    } else {
      const saved = localStorage.getItem("studentNumber") || "";
      setSelectedStudentNumber(saved);
    }
  }, [user]);

  useEffect(() => {
    if (selectedStudentNumber) {
      localStorage.setItem("studentNumber", selectedStudentNumber);
    }
  }, [selectedStudentNumber]);

  const currentStudent = useMemo(() => students.find(s => s.studentNumber === selectedStudentNumber), [students, selectedStudentNumber]);
  const myRegistrations = useMemo(() => registrations.filter(r => r.student?.id === currentStudent?.id), [registrations, currentStudent]);
  const myCourses = useMemo(() => myRegistrations.map(r => ({ id: r.course?.id, code: r.course?.code, title: r.course?.title, credits: r.course?.credits, instructor: r.course?.instructor, registrationDate: r.registrationDate })), [myRegistrations]);
  const availableCourses = useMemo(() => courses.filter(c => !myRegistrations.some(r => r.course?.id === c.id)), [courses, myRegistrations]);

  const handleRegister = async (courseId: number) => {
    try {
      const student = currentStudent;
      if (!student) {
        toast({ title: "Select Student", description: "Please select your student number.", variant: "destructive" });
        return;
      }
      const payload = { student: { id: student.id }, course: { id: courseId }, registrationDate: new Date().toISOString().split('T')[0] };
      await api.post(`${baseUrl}/api/registrations`, payload);
      await fetchRegistrations();
      toast({ title: "Registration Successful", description: "You have been registered for the course." });
    } catch (e) {
      toast({ title: "Error", description: "Failed to register.", variant: "destructive" });
    }
  };

  const handleDrop = async (courseId: number) => {
    try {
      const reg = myRegistrations.find(r => r.course?.id === courseId);
      if (!reg) return;
      await api.delete(`${baseUrl}/api/registrations/${reg.id}`);
      await fetchRegistrations();
      toast({ title: "Course Dropped", description: "You have dropped the course.", variant: "destructive" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to drop course.", variant: "destructive" });
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-university-success text-white';
    if (grade.startsWith('B')) return 'bg-university-blue text-white';
    if (grade.startsWith('C')) return 'bg-university-warning text-white';
    return 'bg-university-gray text-white';
  };

  const renderProfile = () => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="pb-4">
        <CardTitle className="text-3xl font-bold text-gray-900">Student Profile</CardTitle>
        <CardDescription className="text-lg text-gray-600">View and manage your personal information.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-base text-gray-700">
        <div><span className="font-semibold">Name:</span> {currentStudent?.name}</div>
        <div><span className="font-semibold">Email:</span> {currentStudent?.email}</div>
        <div><span className="font-semibold">Student Number:</span> {currentStudent?.studentNumber}</div>
      </CardContent>
    </Card>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50", isSidebarExpanded ? "admin-dashboard-container expanded" : "admin-dashboard-container")}>
      <StudentNavigation activeTab={activeTab} setActiveTab={setActiveTab} setIsExpanded={setIsSidebarExpanded} />
      
      <div className="flex-1 transition-all duration-300" style={{ marginLeft: isSidebarExpanded ? "var(--sidebar-width-expanded)" : "var(--sidebar-width-collapsed)" }}>
        <div className="container mx-auto px-6 py-10">
          {/* Header (now dynamic based on activeTab) */}
          {activeTab === "courses" && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Student Dashboard</h1>
                <p className="text-xl text-gray-600">Welcome back! Manage your courses, track progress, and view your academic records.</p>
              </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-primary">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-700">Enrolled Courses</CardTitle>
                    <div className="rounded-full p-3 bg-gradient-to-br from-blue-400 to-teal-400">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900">{myCourses.length}</div>
                    <p className="text-base text-gray-500">Active this semester</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-accent">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-700">Total Credits</CardTitle>
                    <div className="rounded-full p-3 bg-gradient-to-br from-blue-400 to-teal-400">
                      <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900">
                      {myCourses.reduce((sum, course: any) => sum + (course.credits || 0), 0)}
                    </div>
                    <p className="text-base text-gray-500">Credit hours enrolled</p>
                  </CardContent>
                </Card>
                
                <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-university-success">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                    <CardTitle className="text-lg font-semibold text-gray-700">Completed Courses</CardTitle>
                    <div className="rounded-full p-3 bg-gradient-to-br from-blue-400 to-teal-400">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900">{results.filter(r => r.studentNumber === selectedStudentNumber).length}</div>
                    <p className="text-base text-gray-500">Courses successfully completed</p>
                  </CardContent>
                </Card>
              </div>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl font-bold text-gray-900">Available Courses</CardTitle>
                  <CardDescription className="text-lg text-gray-600">Browse and register for available courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Code</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Name</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Credits</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Instructor</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {availableCourses.map((course) => (
                        <TableRow key={course.id}>
                          <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-base text-gray-900">{course.code}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{course.title}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600"><Badge variant="secondary">{course.credits}</Badge></TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{course.instructor}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                            <Button 
                              size="sm" 
                              onClick={() => handleRegister(course.id)}
                              className="bg-university-success hover:bg-university-success/90 text-white font-semibold"
                            >
                              <Plus className="h-5 w-5 mr-1" />
                              Register
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "my-courses" && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3">My Enrolled Courses</h1>
                <p className="text-xl text-gray-600">Courses you are currently enrolled in.</p>
              </div>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl font-bold text-gray-900">My Enrolled Courses</CardTitle>
                  <CardDescription className="text-lg text-gray-600">Courses you are currently enrolled in</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Code</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Name</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Credits</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Instructor</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Registration Date</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {myCourses.map((course: any) => (
                        <TableRow key={course.id}>
                          <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-base text-gray-900">{course.code}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{course.title}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600"><Badge variant="secondary">{course.credits}</Badge></TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{course.instructor}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{course.registrationDate}</TableCell>
                          <TableCell className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDrop(course.id)}
                              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                            >
                              <Minus className="h-5 w-5 mr-1" />
                              Drop Course
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "results" && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Academic Results</h1>
                <p className="text-xl text-gray-600">Your grades and academic performance.</p>
              </div>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
                <CardHeader className="pb-4">
                  <CardTitle className="text-3xl font-bold text-gray-900">Academic Results</CardTitle>
                  <CardDescription className="text-lg text-gray-600">Your grades and academic performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="min-w-full divide-y divide-gray-200">
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Code</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Title</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Grade</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Credits</TableHead>
                        <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Semester</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="bg-white divide-y divide-gray-200">
                      {results
                        .filter((r) => r.studentNumber === selectedStudentNumber)
                        .map((result) => (
                          <TableRow key={result.id}>
                            <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-base text-gray-900">{result.courseCode}</TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{result.courseName}</TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`px-2 py-1 rounded-full text-sm font-semibold ${getGradeColor(result.grade)}`}>
                                {result.grade}
                              </Badge>
                            </TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{courses.find(c => c.code === result.courseCode)?.credits ?? "-"}</TableCell>
                            <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">-</TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
          
          {activeTab === "profile" && renderProfile()}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
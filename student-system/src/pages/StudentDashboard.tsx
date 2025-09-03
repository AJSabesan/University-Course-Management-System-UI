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

  return (
    <div className="min-h-screen bg-background">
      <StudentNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Manage your courses and track your progress.</p>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <Label htmlFor="student-number">Your Student Number</Label>
              <Input id="student-number" value={selectedStudentNumber} onChange={(e) => setSelectedStudentNumber(e.target.value)} placeholder="e.g., STU001" />
            </div>
            <div className="md:col-span-2 text-sm text-muted-foreground self-end">
              {currentStudent ? `Logged in as ${currentStudent.name} (${currentStudent.email})` : "Enter your student number to see your data."}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{myCourses.length}</div>
              <p className="text-xs text-muted-foreground">Active this semester</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {myCourses.reduce((sum, course: any) => sum + (course.credits || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Credit hours enrolled</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{results.filter(r => r.studentNumber === selectedStudentNumber).length}</div>
              <p className="text-xs text-muted-foreground">Courses completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="courses">Available Courses</TabsTrigger>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="courses">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Available Courses</CardTitle>
                <CardDescription>Browse and register for available courses</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {availableCourses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            onClick={() => handleRegister(course.id)}
                            className="bg-university-success hover:bg-university-success/90"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Register
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="my-courses">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>My Courses</CardTitle>
                <CardDescription>Courses you are currently enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Name</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Registration Date</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myCourses.map((course: any) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.code}</TableCell>
                        <TableCell>{course.title}</TableCell>
                        <TableCell>{course.credits}</TableCell>
                        <TableCell>{course.instructor}</TableCell>
                        <TableCell>{course.registrationDate}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDrop(course.id)}
                          >
                            <Minus className="h-4 w-4 mr-1" />
                            Drop
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="results">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Academic Results</CardTitle>
                <CardDescription>Your grades and academic performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Semester</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results
                      .filter((r) => r.studentNumber === selectedStudentNumber)
                      .map((result) => (
                        <TableRow key={result.id}>
                          <TableCell className="font-medium">{result.courseCode}</TableCell>
                          <TableCell>{result.courseName}</TableCell>
                          <TableCell>
                            <Badge className={getGradeColor(result.grade)}>
                              {result.grade}
                            </Badge>
                          </TableCell>
                          <TableCell>{courses.find(c => c.code === result.courseCode)?.credits ?? "-"}</TableCell>
                          <TableCell>-</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default StudentDashboard;
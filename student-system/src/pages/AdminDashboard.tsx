import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BookOpen, Users, Trophy, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AdminNavigation } from "@/components/AdminNavigation";
import { RegisterStudentDialog } from "@/components/RegisterStudentDialog";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

const baseUrl = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  // Course Management
  const [newCourse, setNewCourse] = useState({ code: "", title: "", credits: "", instructor: "" });
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<{ id: number | null; code: string; title: string; credits: string | number; instructor: string }>({ id: null, code: "", title: "", credits: "", instructor: "" });

  // Student Management
  const [newStudent, setNewStudent] = useState({ name: "", email: "", studentNumber: "" });
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isEditStudentOpen, setIsEditStudentOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<{ id: number | null; name: string; email: string; studentNumber: string }>({ id: null, name: "", email: "", studentNumber: "" });

  // Result Management
  const [newResult, setNewResult] = useState({ studentNumber: "", courseCode: "", grade: "" });
  const [isAddResultOpen, setIsAddResultOpen] = useState(false);
  const [isEditResultOpen, setIsEditResultOpen] = useState(false);
  const [editResult, setEditResult] = useState<{ id: number | null; studentNumber: string; courseCode: string; grade: string }>({ id: null, studentNumber: "", courseCode: "", grade: "" });

  // Password visibility state
  const [showPasswords, setShowPasswords] = useState<{ [key: number]: boolean }>({});

  // New GET functions
  const fetchCourses = async () => {
    try {
      const response = await api.get(`${baseUrl}/api/courses`);
      setCourses(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses.",
        variant: "destructive",
      });
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await api.get(`${baseUrl}/api/students`);
      setStudents(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students.",
        variant: "destructive",
      });
    }
  };

  // Add Result
  const handleAddResult = async () => {
    if (!newResult.studentNumber || !newResult.courseCode || !newResult.grade) {
      toast({
        title: "Missing Fields",
        description: "Please fill in student number, course code, and grade.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        studentNumber: newResult.studentNumber,
        courseCode: newResult.courseCode,
        grade: newResult.grade,
      };

      await api.post(`${baseUrl}/api/results`, payload);
      await fetchResults();
      setNewResult({ studentNumber: "", courseCode: "", grade: "" });
      setIsAddResultOpen(false);

      toast({
        title: "Result Added",
        description: `Result for ${payload.studentNumber} in ${payload.courseCode} has been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add result. Ensure student/course exist.",
        variant: "destructive",
      });
    }
  };

  // Delete Result
  const handleDeleteResult = async (resultId: number) => {
    try {
      await api.delete(`${baseUrl}/api/results/${resultId}`);
      await fetchResults();
      toast({
        title: "Result Deleted",
        description: "Result has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete result.",
        variant: "destructive",
      });
    }
  };

  // Edit Result
  const openEditResult = (result: any) => {
    setEditResult({ id: result.id, studentNumber: result.studentNumber || "", courseCode: result.courseCode || "", grade: result.grade || "" });
    setIsEditResultOpen(true);
  };

  const handleUpdateResult = async () => {
    if (!editResult.id || !editResult.studentNumber || !editResult.courseCode || !editResult.grade) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all fields before updating.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        studentNumber: editResult.studentNumber,
        courseCode: editResult.courseCode,
        grade: editResult.grade,
      };
      await api.put(`${baseUrl}/api/results/${editResult.id}`, payload);
      await fetchResults();
      setIsEditResultOpen(false);
      toast({
        title: "Result Updated",
        description: `Result for ${payload.studentNumber} in ${payload.courseCode} updated.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update result.",
        variant: "destructive",
      });
    }
  };

  const fetchResults = async () => {
    try {
      const response = await api.get(`${baseUrl}/api/results`);
      setResults(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch results.",
        variant: "destructive",
      });
    }
  };

  // Modified useEffect to use new fetch functions
  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([fetchCourses(), fetchStudents(), fetchResults()]);
    };

    fetchData();
  }, [toast]);

  // Modified handleAddCourse
  const handleAddCourse = async () => {
    if (!newCourse.code || !newCourse.title || !newCourse.credits || !newCourse.instructor) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all course fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const course = {
        code: newCourse.code,
        title: newCourse.title,
        credits: parseInt(newCourse.credits),
        instructor: newCourse.instructor,
      };

      await api.post(`${baseUrl}/api/courses`, course);
      await fetchCourses(); // Refresh courses after adding
      setNewCourse({ code: "", title: "", credits: "", instructor: "" });
      setIsAddCourseOpen(false);

      toast({
        title: "Course Added",
        description: `${course.title} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add course.",
        variant: "destructive",
      });
    }
  };

  // Modified handleDeleteCourse
  const handleDeleteCourse = async (courseId: number) => {
    try {
      await api.delete(`${baseUrl}/api/courses/${courseId}`);
      await fetchCourses(); // Refresh courses after deleting
      toast({
        title: "Course Deleted",
        description: "Course has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course.",
        variant: "destructive",
      });
    }
  };

  // Edit Course
  const openEditCourse = (course: any) => {
    setEditCourse({
      id: course.id,
      code: course.code || "",
      title: course.title || "",
      credits: String(course.credits ?? ""),
      instructor: course.instructor || "",
    });
    setIsEditCourseOpen(true);
  };

  const handleUpdateCourse = async () => {
    if (!editCourse.id || !editCourse.code || !editCourse.title || !editCourse.credits || !editCourse.instructor) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all course fields before updating.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        code: editCourse.code,
        title: editCourse.title,
        credits: parseInt(String(editCourse.credits)),
        instructor: editCourse.instructor,
      };
      await api.put(`${baseUrl}/api/courses/${editCourse.id}`, payload);
      await fetchCourses();
      setIsEditCourseOpen(false);
      toast({ title: "Course Updated", description: `${payload.title} has been updated.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update course.", variant: "destructive" });
    }
  };

  // Modified handleAddStudent
  const handleAddStudent = async () => {
    if (!newStudent.name || !newStudent.email || !newStudent.studentNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all student fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const student = {
        name: newStudent.name,
        email: newStudent.email,
        studentNumber: newStudent.studentNumber,
      };

      await api.post(`${baseUrl}/api/students`, student);
      await fetchStudents(); // Refresh students after adding
      setNewStudent({ name: "", email: "", studentNumber: "" });
      setIsAddStudentOpen(false);

      toast({
        title: "Student Added",
        description: `${student.name} has been added successfully.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add student.",
        variant: "destructive",
      });
    }
  };

  // Modified handleDeleteStudent
  const handleDeleteStudent = async (studentId: number) => {
    try {
      await api.delete(`${baseUrl}/api/students/${studentId}`);
      await fetchStudents(); // Refresh students after deleting
      toast({
        title: "Student Deleted",
        description: "Student has been removed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete student.",
        variant: "destructive",
      });
    }
  };

  // Edit Student
  const openEditStudent = (student: any) => {
    setEditStudent({
      id: student.id,
      name: student.name || "",
      email: student.email || "",
      studentNumber: student.studentNumber || "",
    });
    setIsEditStudentOpen(true);
  };

  const handleUpdateStudent = async () => {
    if (!editStudent.id || !editStudent.name || !editStudent.email || !editStudent.studentNumber) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all student fields before updating.",
        variant: "destructive",
      });
      return;
    }
    try {
      const payload = {
        name: editStudent.name,
        email: editStudent.email,
        studentNumber: editStudent.studentNumber,
      };
      await api.put(`${baseUrl}/api/students/${editStudent.id}`, payload);
      await fetchStudents();
      setIsEditStudentOpen(false);
      toast({ title: "Student Updated", description: `${payload.name} has been updated.` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update student.", variant: "destructive" });
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'bg-university-success text-white';
    if (grade.startsWith('B')) return 'bg-university-blue text-white';
    if (grade.startsWith('C')) return 'bg-university-warning text-white';
    return 'bg-university-gray text-white';
  };

  const togglePasswordVisibility = (studentId: number) => {
    setShowPasswords(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700">Total Courses</CardTitle>
            <div className="rounded-full p-3 bg-gradient-to-br from-blue-400 to-teal-400">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{courses.length}</div>
            <p className="text-base text-gray-500">Active courses in the system</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700">Total Students</CardTitle>
            <div className="rounded-full p-3 bg-gradient-to-br from-blue-400 to-teal-400">
              <Users className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{students.length}</div>
            <p className="text-base text-gray-500">Registered students</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-university-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700">Total Results</CardTitle>
            <div className="rounded-full p-3 bg-gradient-to-br from-blue-400 to-teal-400">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">{results.length}</div>
            <p className="text-base text-gray-500">Academic results recorded</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out border-l-4 border-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-lg font-semibold text-gray-700">System Status</CardTitle>
            <div className="rounded-full p-3 bg-gradient-to-br from-blue-400 to-teal-400">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-gray-900">100%</div>
            <p className="text-base text-gray-500">Operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold text-gray-800">Recent Courses</CardTitle>
            <CardDescription className="text-base text-gray-500">Latest courses added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.slice(-3).map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div>
                    <p className="font-medium text-lg text-gray-800">{course.code} - {course.title}</p>
                    <p className="text-base text-gray-600">Instructor: {course.instructor}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors duration-200">{course.credits} Credits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold text-gray-800">Recent Students</CardTitle>
            <CardDescription className="text-base text-gray-500">Latest students registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.slice(-3).map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                  <div>
                    <p className="font-medium text-lg text-gray-800">{student.name}</p>
                    <p className="text-base text-gray-600">{student.studentNumber} - {student.email}</p>
                  </div>
                  <Badge variant="outline" className="text-gray-700">Student</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCourses = () => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-3xl font-bold text-gray-900">Course Management</CardTitle>
          <CardDescription className="text-lg text-gray-600">Add, edit, and manage university courses</CardDescription>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md">
              <Plus className="h-5 w-5 mr-2" />
              Add New Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add New Course</DialogTitle>
              <DialogDescription className="text-base">Fill in the course details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right text-base">Course Code</Label>
                <Input
                  id="code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                  placeholder="e.g., CS101"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right text-base">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="e.g., Introduction to Computer Science"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="credits" className="text-right text-base">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                  placeholder="e.g., 3"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instructor" className="text-right text-base">Instructor</Label>
                <Input
                  id="instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  placeholder="e.g., Dr. Smith"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddCourseOpen(false)}>Cancel</Button>
              <Button onClick={handleAddCourse}>Add Course</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Code</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Title</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Credits</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Instructor</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-base text-gray-900">{course.code}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{course.title}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600"><Badge variant="secondary">{course.credits}</Badge></TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{course.instructor}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                  <div className="flex space-x-2">
                    <Button size="icon" variant="outline" className="h-9 w-9 text-blue-600 hover:text-blue-900 hover:bg-blue-50" onClick={() => openEditCourse(course)}>
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive"
                      className="h-9 w-9 bg-red-600 hover:bg-red-700"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  // Edit Course Dialog
  const renderEditCourseDialog = () => (
    <Dialog open={isEditCourseOpen} onOpenChange={setIsEditCourseOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Course</DialogTitle>
          <DialogDescription className="text-base">Update the course details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-code" className="text-right text-base">Course Code</Label>
            <Input
              id="edit-code"
              value={editCourse.code}
              onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })}
              placeholder="e.g., CS101"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-title" className="text-right text-base">Course Title</Label>
            <Input
              id="edit-title"
              value={editCourse.title}
              onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
              placeholder="e.g., Introduction to Computer Science"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-credits" className="text-right text-base">Credits</Label>
            <Input
              id="edit-credits"
              type="number"
              value={editCourse.credits}
              onChange={(e) => setEditCourse({ ...editCourse, credits: e.target.value })}
              placeholder="e.g., 3"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-instructor" className="text-right text-base">Instructor</Label>
            <Input
              id="edit-instructor"
              value={editCourse.instructor}
              onChange={(e) => setEditCourse({ ...editCourse, instructor: e.target.value })}
              placeholder="e.g., Dr. Smith"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditCourseOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateCourse}>Update Course</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // Edit Student Dialog
  const renderEditStudentDialog = () => (
    <Dialog open={isEditStudentOpen} onOpenChange={setIsEditStudentOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Edit Student</DialogTitle>
          <DialogDescription className="text-base">Update the student details below.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-student-name" className="text-right text-base">Full Name</Label>
            <Input
              id="edit-student-name"
              value={editStudent.name}
              onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
              placeholder="e.g., John Doe"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-student-email" className="text-right text-base">Email</Label>
            <Input
              id="edit-student-email"
              type="email"
              value={editStudent.email}
              onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
              placeholder="e.g., john.doe@university.edu"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="edit-student-number" className="text-right text-base">Student Number</Label>
            <Input
              id="edit-student-number"
              value={editStudent.studentNumber}
              onChange={(e) => setEditStudent({ ...editStudent, studentNumber: e.target.value })}
              placeholder="e.g., STU001"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsEditStudentOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateStudent}>Update Student</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const renderStudents = () => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-3xl font-bold text-gray-900">Student Management</CardTitle>
          <CardDescription className="text-lg text-gray-600">Add, edit, and manage student accounts</CardDescription>
        </div>
        <RegisterStudentDialog onStudentRegistered={fetchStudents} />
      </CardHeader>
      <CardContent>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Student Number</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Password</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-base text-gray-900">{student.studentNumber}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{student.name}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{student.email}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <span className="text-base text-gray-600">
                      {student.user?.password
                        ? (showPasswords[student.id] ? student.user.password : "••••••••")
                        : "-"
                      }
                    </span>
                    {student.user?.password && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => togglePasswordVisibility(student.id)}
                        className="h-8 w-8 p-0 text-gray-500 hover:bg-gray-100"
                      >
                        {showPasswords[student.id] ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                  <div className="flex space-x-2">
                    <Button size="icon" variant="outline" className="h-9 w-9 text-blue-600 hover:text-blue-900 hover:bg-blue-50" onClick={() => openEditStudent(student)}>
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive"
                      className="h-9 w-9 bg-red-600 hover:bg-red-700"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );

  const renderResults = () => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 ease-in-out">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle className="text-3xl font-bold text-gray-900">Results Management</CardTitle>
          <CardDescription className="text-lg text-gray-600">View and manage student grades and results</CardDescription>
        </div>
        <Dialog open={isAddResultOpen} onOpenChange={setIsAddResultOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold py-2 px-4 rounded-md">
              <Plus className="h-5 w-5 mr-2" />
              Add New Result
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Add New Result</DialogTitle>
              <DialogDescription className="text-base">Record a grade for a student and course.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="studentNumber" className="text-right text-base">Student Number</Label>
                <Input
                  id="studentNumber"
                  value={newResult.studentNumber}
                  onChange={(e) => setNewResult({ ...newResult, studentNumber: e.target.value })}
                  placeholder="e.g., STU001"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="courseCode" className="text-right text-base">Course Code</Label>
                <Input
                  id="courseCode"
                  value={newResult.courseCode}
                  onChange={(e) => setNewResult({ ...newResult, courseCode: e.target.value })}
                  placeholder="e.g., CS101"
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="grade" className="text-right text-base">Grade</Label>
                <Input
                  id="grade"
                  value={newResult.grade}
                  onChange={(e) => setNewResult({ ...newResult, grade: e.target.value })}
                  placeholder="e.g., A, B+, C"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddResultOpen(false)}>Cancel</Button>
              <Button onClick={handleAddResult}>Add Result</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table className="min-w-full divide-y divide-gray-200">
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Student Number</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Code</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Course Name</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Grade</TableHead>
              <TableHead className="px-6 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white divide-y divide-gray-200">
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-base text-gray-900">{result.studentNumber}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{result.courseCode}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-base text-gray-600">{result.courseName}</TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap">
                  <Badge className={`px-2 py-1 rounded-full text-sm font-semibold ${getGradeColor(result.grade)}`}>
                    {result.grade}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 whitespace-nowrap text-right text-base font-medium">
                  <div className="flex space-x-2">
                    <Button size="icon" variant="outline" className="h-9 w-9 text-blue-600 hover:text-blue-900 hover:bg-blue-50" onClick={() => openEditResult(result)}>
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button size="icon" variant="destructive" className="h-9 w-9 bg-red-600 hover:bg-red-700" onClick={() => handleDeleteResult(result.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      {/* Edit Result Dialog */}
      <Dialog open={isEditResultOpen} onOpenChange={setIsEditResultOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Edit Result</DialogTitle>
            <DialogDescription className="text-base">Update the grade or identifiers for this result.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-studentNumber" className="text-right text-base">Student Number</Label>
              <Input
                id="edit-studentNumber"
                value={editResult.studentNumber}
                onChange={(e) => setEditResult({ ...editResult, studentNumber: e.target.value })}
                placeholder="e.g., STU001"
                className="col-span-3"
              />
            </div>
            <div>
              <Label htmlFor="edit-courseCode" className="text-right text-base">Course Code</Label>
              <Input
                id="edit-courseCode"
                value={editResult.courseCode}
                onChange={(e) => setEditResult({ ...editResult, courseCode: e.target.value })}
                placeholder="e.g., CS101"
                className="col-span-3"
              />
            </div>
            <div>
              <Label htmlFor="edit-grade" className="text-right text-base">Grade</Label>
              <Input
                id="edit-grade"
                value={editResult.grade}
                onChange={(e) => setEditResult({ ...editResult, grade: e.target.value })}
                placeholder="e.g., A, B+, C"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditResultOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateResult}>Update Result</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );

  return (
    <div className={cn("min-h-screen bg-gray-50", isSidebarExpanded ? "admin-dashboard-container expanded" : "admin-dashboard-container")}>
      <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} setIsExpanded={setIsSidebarExpanded} />
      
      <div className="flex-1 transition-all duration-300" style={{ marginLeft: isSidebarExpanded ? "var(--sidebar-width-expanded)" : "var(--sidebar-width-collapsed)" }}>
        {/* Content based on active tab */}
        <div className="container mx-auto px-6 py-10">
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-5xl font-extrabold text-gray-900 mb-3">Admin Dashboard</h1>
                <p className="text-xl text-gray-600">Manage university courses, student registrations, and academic records with ease.</p>
              </div>
              {renderOverview()}
            </div>
          )}
          {activeTab === "courses" && renderCourses()}
          {activeTab === "students" && renderStudents()}
          {activeTab === "results" && renderResults()}
          {renderEditCourseDialog()}
          {renderEditStudentDialog()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
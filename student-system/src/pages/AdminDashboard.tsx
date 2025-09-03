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

const baseUrl = import.meta.env.VITE_API_URL;

const AdminDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

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
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{courses.length}</div>
            <p className="text-xs text-muted-foreground">Active courses</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{students.length}</div>
            <p className="text-xs text-muted-foreground">Registered students</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Results</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{results.length}</div>
            <p className="text-xs text-muted-foreground">Recorded grades</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Courses</CardTitle>
            <CardDescription>Latest courses added to the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {courses.slice(-3).map((course) => (
                <div key={course.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{course.code}</p>
                    <p className="text-sm text-muted-foreground">{course.title}</p>
                  </div>
                  <Badge variant="secondary">{course.credits} credits</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Recent Students</CardTitle>
            <CardDescription>Latest students registered in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {students.slice(-3).map((student) => (
                <div key={student.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.email}</p>
                  </div>
                  <Badge variant="outline">{student.studentNumber}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCourses = () => (
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Course Management</CardTitle>
          <CardDescription>Add, edit, and manage university courses</CardDescription>
        </div>
        <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>Fill in the course details below.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({...newCourse, code: e.target.value})}
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
                  placeholder="e.g., Introduction to Computer Science"
                />
              </div>
              <div>
                <Label htmlFor="credits">Credits</Label>
                <Input
                  id="credits"
                  type="number"
                  value={newCourse.credits}
                  onChange={(e) => setNewCourse({...newCourse, credits: e.target.value})}
                  placeholder="e.g., 3"
                />
              </div>
              <div>
                <Label htmlFor="instructor">Instructor</Label>
                <Input
                  id="instructor"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({...newCourse, instructor: e.target.value})}
                  placeholder="e.g., Dr. Smith"
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Title</TableHead>
              <TableHead>Credits</TableHead>
              <TableHead>Instructor</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id}>
                <TableCell className="font-medium">{course.code}</TableCell>
                <TableCell>{course.title}</TableCell>
                <TableCell>{course.credits}</TableCell>
                <TableCell>{course.instructor}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditCourse(course)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
          <DialogDescription>Update the course details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-code">Course Code</Label>
            <Input
              id="edit-code"
              value={editCourse.code}
              onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })}
              placeholder="e.g., CS101"
            />
          </div>
          <div>
            <Label htmlFor="edit-title">Course Title</Label>
            <Input
              id="edit-title"
              value={editCourse.title}
              onChange={(e) => setEditCourse({ ...editCourse, title: e.target.value })}
              placeholder="e.g., Introduction to Computer Science"
            />
          </div>
          <div>
            <Label htmlFor="edit-credits">Credits</Label>
            <Input
              id="edit-credits"
              type="number"
              value={editCourse.credits}
              onChange={(e) => setEditCourse({ ...editCourse, credits: e.target.value })}
              placeholder="e.g., 3"
            />
          </div>
          <div>
            <Label htmlFor="edit-instructor">Instructor</Label>
            <Input
              id="edit-instructor"
              value={editCourse.instructor}
              onChange={(e) => setEditCourse({ ...editCourse, instructor: e.target.value })}
              placeholder="e.g., Dr. Smith"
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
          <DialogDescription>Update the student details below.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-student-name">Full Name</Label>
            <Input
              id="edit-student-name"
              value={editStudent.name}
              onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
              placeholder="e.g., John Doe"
            />
          </div>
          <div>
            <Label htmlFor="edit-student-email">Email</Label>
            <Input
              id="edit-student-email"
              type="email"
              value={editStudent.email}
              onChange={(e) => setEditStudent({ ...editStudent, email: e.target.value })}
              placeholder="e.g., john.doe@university.edu"
            />
          </div>
          <div>
            <Label htmlFor="edit-student-number">Student Number</Label>
            <Input
              id="edit-student-number"
              value={editStudent.studentNumber}
              onChange={(e) => setEditStudent({ ...editStudent, studentNumber: e.target.value })}
              placeholder="e.g., STU001"
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
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Student Management</CardTitle>
          <CardDescription>Add, edit, and manage student accounts</CardDescription>
        </div>
        <RegisterStudentDialog onStudentRegistered={fetchStudents} />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Password</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.studentNumber}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <span>
                      {student.user?.password
                        ? (showPasswords[student.id] ? student.user.password : "••••••••")
                        : "-"
                      }
                    </span>
                    {student.user?.password && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => togglePasswordVisibility(student.id)}
                        className="h-6 w-6 p-0"
                      >
                        {showPasswords[student.id] ? (
                          <EyeOff className="h-3 w-3" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditStudent(student)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDeleteStudent(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
    <Card className="shadow-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Results Management</CardTitle>
          <CardDescription>View and manage student grades and results</CardDescription>
        </div>
        <Dialog open={isAddResultOpen} onOpenChange={setIsAddResultOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Result
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Result</DialogTitle>
              <DialogDescription>Record a grade for a student and course.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="studentNumber">Student Number</Label>
                <Input
                  id="studentNumber"
                  value={newResult.studentNumber}
                  onChange={(e) => setNewResult({ ...newResult, studentNumber: e.target.value })}
                  placeholder="e.g., STU001"
                />
              </div>
              <div>
                <Label htmlFor="courseCode">Course Code</Label>
                <Input
                  id="courseCode"
                  value={newResult.courseCode}
                  onChange={(e) => setNewResult({ ...newResult, courseCode: e.target.value })}
                  placeholder="e.g., CS101"
                />
              </div>
              <div>
                <Label htmlFor="grade">Grade</Label>
                <Input
                  id="grade"
                  value={newResult.grade}
                  onChange={(e) => setNewResult({ ...newResult, grade: e.target.value })}
                  placeholder="e.g., A, B+, C"
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
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student Number</TableHead>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Grade</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.id}>
                <TableCell className="font-medium">{result.studentNumber}</TableCell>
                <TableCell>{result.courseCode}</TableCell>
                <TableCell>{result.courseName}</TableCell>
                <TableCell>
                  <Badge className={getGradeColor(result.grade)}>
                    {result.grade}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openEditResult(result)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteResult(result.id)}>
                      <Trash2 className="h-4 w-4" />
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Result</DialogTitle>
            <DialogDescription>Update the grade or identifiers for this result.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-studentNumber">Student Number</Label>
              <Input
                id="edit-studentNumber"
                value={editResult.studentNumber}
                onChange={(e) => setEditResult({ ...editResult, studentNumber: e.target.value })}
                placeholder="e.g., STU001"
              />
            </div>
            <div>
              <Label htmlFor="edit-courseCode">Course Code</Label>
              <Input
                id="edit-courseCode"
                value={editResult.courseCode}
                onChange={(e) => setEditResult({ ...editResult, courseCode: e.target.value })}
                placeholder="e.g., CS101"
              />
            </div>
            <div>
              <Label htmlFor="edit-grade">Grade</Label>
              <Input
                id="edit-grade"
                value={editResult.grade}
                onChange={(e) => setEditResult({ ...editResult, grade: e.target.value })}
                placeholder="e.g., A, B+, C"
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
    <div className="min-h-screen bg-background">
      <AdminNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage courses, students, and academic records.</p>
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && renderOverview()}
        {activeTab === "courses" && renderCourses()}
        {activeTab === "students" && renderStudents()}
        {activeTab === "results" && renderResults()}
        {renderEditCourseDialog()}
        {renderEditStudentDialog()}
      </div>
    </div>
  );
};

export default AdminDashboard;
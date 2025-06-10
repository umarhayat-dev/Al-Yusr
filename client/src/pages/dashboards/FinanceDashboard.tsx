import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Search, DollarSign, Users, TrendingUp, Download } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { rtdb } from '@/lib/firebase';

export default function FinanceDashboard() {
  const [activeStudents, setActiveStudents] = useState<any[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Fetch all active students from Firebase
  useEffect(() => {
    const fetchActiveStudents = async () => {
      try {
        const activeStudentsRef = ref(rtdb, 'active-students');
        onValue(activeStudentsRef, (snapshot) => {
          const students = snapshot.val();
          if (students) {
            const studentsList = Object.entries(students).map(([key, student]: [string, any]) => ({
              id: key,
              ...student,
              fee: parseFloat(student.fee) || 0,
              teacherPay: parseFloat(student['te-pay']) || 0,
              teacherPayCurr: student['te-pay-curr'] || 'AED'
            }));
            setActiveStudents(studentsList);
            setFilteredStudents(studentsList);
          }
        });
      } catch (error) {
        console.error('Error fetching active students:', error);
      }
    };

    fetchActiveStudents();
  }, []);

  // Filter students based on search term
  useEffect(() => {
    const filtered = activeStudents.filter(student =>
      Object.values(student).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredStudents(filtered);
  }, [searchTerm, activeStudents]);

  // Sort function
  const handleSort = (field: string) => {
    const direction = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(direction);

    const sorted = [...filteredStudents].sort((a, b) => {
      const aVal = a[field] || '';
      const bVal = b[field] || '';
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return direction === 'asc' 
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    });
    
    setFilteredStudents(sorted);
  };

  // Calculate financial summary
  const totalRevenue = activeStudents.reduce((sum, student) => sum + (student.fee || 0), 0);
  const totalTeacherPay = activeStudents.reduce((sum, student) => sum + (student.teacherPay || 0), 0);
  const netProfit = totalRevenue - totalTeacherPay;

  const SortButton = ({ field, label }: { field: string; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-8 p-0 font-semibold"
    >
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
          <p className="text-gray-600">Financial overview and student payment tracking</p>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-green-600">AED {totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-blue-600">AED {totalTeacherPay.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Teacher Payments</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-purple-600">AED {netProfit.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Net Profit</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-600">{activeStudents.length}</p>
                  <p className="text-sm text-gray-600">Active Students</p>
                </div>
                <Users className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Active Students Financial Details</CardTitle>
                <CardDescription>
                  Complete overview of all active students with financial information
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead><SortButton field="st-serial" label="Student ID" /></TableHead>
                    <TableHead><SortButton field="student-name" label="Student Name" /></TableHead>
                    <TableHead><SortButton field="st-email" label="Email" /></TableHead>
                    <TableHead><SortButton field="course-code" label="Course" /></TableHead>
                    <TableHead><SortButton field="fee" label="Student Fee" /></TableHead>
                    <TableHead><SortButton field="currency" label="Currency" /></TableHead>
                    <TableHead><SortButton field="teacher-name" label="Teacher" /></TableHead>
                    <TableHead><SortButton field="te-serial" label="Teacher ID" /></TableHead>
                    <TableHead><SortButton field="te-pay" label="Teacher Pay" /></TableHead>
                    <TableHead><SortButton field="te-pay-curr" label="Pay Currency" /></TableHead>
                    <TableHead><SortButton field="status" label="Status" /></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student.id || index}>
                      <TableCell className="font-medium">{student['st-serial'] || '-'}</TableCell>
                      <TableCell>{student['student-name'] || student['st-name'] || '-'}</TableCell>
                      <TableCell>{student['st-email'] || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{student['course-code'] || '-'}</Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {student.fee ? `${student.fee}` : '-'}
                      </TableCell>
                      <TableCell>{student.currency || '-'}</TableCell>
                      <TableCell>{student['teacher-name'] || '-'}</TableCell>
                      <TableCell>{student['te-serial'] || '-'}</TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {student['te-pay'] ? `${student['te-pay']}` : '-'}
                      </TableCell>
                      <TableCell>{student['te-pay-curr'] || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                          {student.status || 'Active'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No students found matching your search criteria.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
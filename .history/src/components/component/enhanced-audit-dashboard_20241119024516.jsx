"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileText, Trash2, AlertCircle, Calendar, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetchAuditData = async (charityId) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`http://localhost:3001/audits/${charityId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!res.ok) {
    throw new Error(`Error fetching audits: ${res.status} ${res.statusText}`);
  }

  return res.json();
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function EnhancedAuditDashboardComponent() {
  const [auditData, setAuditData] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfileAndAudits = async () => {
      const token = localStorage.getItem('authToken');

      if (!token) {
        setError('PAGINA PROTEGIDA TIENES QUE INICIAR SESION');
        return;
      }

      try {
        const profileRes = await fetch(`http://localhost:3001/profile?secret_token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileRes.ok) {
          throw new Error(`Error fetching profile: ${profileRes.status} ${profileRes.statusText}`);
        }

        const profileData = await profileRes.json();

        if (profileData.charity && profileData.charity.userType === 'charity') {
          const charityId = profileData.charity.id;
          const audits = await fetchAuditData(charityId);
          setAuditData(audits);
        } else {
          setError('No autorizado. Solo las organizaciones pueden acceder a esta página.');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error fetching profile or audits');
      }
    };

    fetchProfileAndAudits();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  const filteredData = auditData.filter(audit => {
    if (timeFilter === 'all') return true;
    const date = new Date(audit.timestamp.$date);
    const now = new Date();
    switch (timeFilter) {
      case 'today':
        return date.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return date > weekAgo;
      case 'month':
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  });

  const actionCounts = filteredData.reduce((acc, audit) => {
    acc[audit.action] = (acc[audit.action] || 0) + 1;
    return acc;
  }, {});

  const pieChartData = Object.entries(actionCounts).map(([name, value]) => ({ name, value }));

  const timelineData = filteredData.reduce((acc, audit) => {
    const date = new Date(audit.timestamp.$date).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const lineChartData = Object.entries(timelineData).map(([date, count]) => ({ date, count }));

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#ECE3D4' }}>
      <h1 className="text-4xl font-bold mb-8" style={{ color: '#042637' }}>Enhanced Audit Dashboard</h1>
      <div className="mb-4">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="details">Audit Details</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total Audits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold" style={{ color: '#042637' }}>{filteredData.length}</div>
                <p className="text-sm text-muted-foreground">in selected time range</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Audit Actions</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {filteredData.slice(0, 5).map((audit) => (
                    <li key={audit._id.$oid} className="flex items-center space-x-2">
                      {audit.action === 'edit' && <Edit size={16} />}
                      {audit.action === 'report' && <FileText size={16} />}
                      {audit.action === 'delete' && <Trash2 size={16} />}
                      <span>{audit.action} - {new Date(audit.timestamp.$date).toLocaleString()}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Audit Timeline</CardTitle>
              <CardDescription>Number of audits over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData}>
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#042637" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
              <CardDescription>Detailed view of all audit actions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((audit) => (
                    <TableRow key={audit._id.$oid}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(audit.timestamp.$date).toLocaleDateString()}</span>
                          <Clock className="h-4 w-4 ml-2" />
                          <span>{new Date(audit.timestamp.$date).toLocaleTimeString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={audit.action === 'edit' ? 'default' : audit.action === 'report' ? 'secondary' : 'destructive'}>
                          {audit.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {audit.action === 'edit' && (
                          <span>
                            Value changed from {audit.details.before.valuePerUnit} to {audit.details.after.valuePerUnit}
                          </span>
                        )}
                        {audit.action === 'report' && (
                          <span>
                            Report type: {audit.details.reportType}, Donations: {audit.details.donationIds.length}
                          </span>
                        )}
                        {audit.action === 'delete' && (
                          <span className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span>Reason: {audit.details.reason}</span>
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
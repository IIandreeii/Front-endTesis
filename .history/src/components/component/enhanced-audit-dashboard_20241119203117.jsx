"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, FileText, Trash2, AlertCircle, Calendar, Clock, LogIn } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fetchAuditData = async (charityId) => {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`https://rwggxws5-3001.brs.devtunnels.ms/audits/${charityId}`, {
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
        setError('PÁGINA PROTEGIDA, TIENES QUE INICIAR SESIÓN');
        return;
      }

      try {
        const profileRes = await fetch(`https://rwggxws5-3001.brs.devtunnels.ms/profile?secret_token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileRes.ok) {
          throw new Error(`Error al obtener el perfil: ${profileRes.status} ${profileRes.statusText}`);
        }

        const profileData = await profileRes.json();

        if (profileData.charity && profileData.charity.userType === 'charity') {
          const charityId = profileData.charity.id;
          const audits = await fetchAuditData(charityId);
          console.log('Datos recibidos del backend:', audits);
          setAuditData(audits);
        } else {
          setError('No autorizado. Solo las organizaciones pueden acceder a esta página.');
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Error al obtener el perfil o las auditorías');
      }
    };

    fetchProfileAndAudits();
  }, []);

  if (error) return <p className="text-red-500">{error}</p>;

  const filteredData = auditData.filter(audit => {
    if (timeFilter === 'all') return true;
    const date = new Date(audit.timestamp);
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
    const date = new Date(audit.timestamp).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const lineChartData = Object.entries(timelineData).map(([date, count]) => ({ date, count }));

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#ECE3D4' }}>
      <h1 className="text-4xl font-bold mb-8" style={{ color: '#042637' }}>Panel de Auditorías Mejorado</h1>
      <div className="mb-4">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Seleccionar rango de tiempo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todo el tiempo</SelectItem>
            <SelectItem value="today">Hoy</SelectItem>
            <SelectItem value="week">Esta semana</SelectItem>
            <SelectItem value="month">Este mes</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="timeline">Línea de tiempo</TabsTrigger>
          <TabsTrigger value="details">Detalles de Auditoría</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Total de Auditorías</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold" style={{ color: '#042637' }}>{filteredData.length}</div>
                <p className="text-sm text-muted-foreground">en el rango de tiempo seleccionado</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Acciones de Auditoría</CardTitle>
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
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {filteredData.slice(0, 5).map((audit) => {
                    const date = new Date(audit.timestamp);
                    const isValidDate = !isNaN(date);
                    return (
                      <li key={audit._id} className="flex items-center space-x-2">
                        {audit.action === 'edit' && <Edit size={16} />}
                        {audit.action === 'report' && <FileText size={16} />}
                        {audit.action === 'delete' && <Trash2 size={16} />}
                        {audit.action === 'login' && <LogIn size={16} />}
                        <span>{audit.action} - {isValidDate ? date.toLocaleString() : 'Fecha inválida'}</span>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Línea de Tiempo de Auditoría</CardTitle>
              <CardDescription>Número de auditorías a lo largo del tiempo</CardDescription>
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
              <CardTitle>Registro de Auditoría</CardTitle>
              <CardDescription>Vista detallada de todas las acciones de auditoría</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha y Hora</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Detalles</TableHead>
                    <TableHead>Usuario</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((audit) => {
                    const date = new Date(audit.timestamp);
                    const isValidDate = !isNaN(date);
                    return (
                      <TableRow key={audit._id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{isValidDate ? date.toLocaleDateString() : 'Fecha inválida'}</span>
                            <Clock className="h-4 w-4 ml-2" />
                            <span>{isValidDate ? date.toLocaleTimeString() : 'Fecha inválida'}</span>
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
                              Valor cambiado de {audit.details.before.valuePerUnit} a {audit.details.after.valuePerUnit}
                            </span>
                          )}
                          {audit.action === 'report' && (
                            <span>
                              Tipo de reporte: {audit.details.reportType}, Donaciones: {audit.details.donationIds.length}
                            </span>
                          )}
                          {audit.action === 'delete' && (
                            <span className="flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span>Razón: {audit.details.reason}</span>
                            </span>
                          )}
                          {audit.action === 'login' && (
                            <span>
                              {audit.details.message}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span>{audit.userName}</span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
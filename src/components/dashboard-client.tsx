'use client';

import { useState, useMemo, FC, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { PlusCircle, Download, Copy, ShieldAlert, BarChart3, ListTodo, Wrench, CheckCircle2 } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { format } from 'date-fns';

import { MaintenanceRequest, MaintenanceCategory, MaintenancePriority, MaintenanceStatus, categories, priorities, statuses } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { NewRequestDialog } from '@/components/new-request-dialog';
import { CategoryIcon } from './icons';
import { detectDuplicateRequests } from '@/ai/flows/detect-duplicate-requests';

interface DashboardClientProps {
  requests: MaintenanceRequest[];
}

const statusIcons: { [key in MaintenanceStatus]: React.ReactNode } = {
  Submitted: <ListTodo className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <Wrench className="h-4 w-4 text-muted-foreground" />,
  Resolved: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
};

const generateReport = (requestsToReport: MaintenanceRequest[]) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          children: [new TextRun("DormFix - Maintenance Report")],
          heading: HeadingLevel.TITLE,
        }),
        new Paragraph({ text: `Report generated on: ${format(new Date(), 'PPP p')}` }),
        new Paragraph({ text: "" }),
        ...requestsToReport.flatMap(req => [
          new Paragraph({
            children: [new TextRun(`Request #${req.id} - Room ${req.roomNumber}`)],
            heading: HeadingLevel.HEADING_2,
            style: "heading2",
          }),
          new Paragraph({ text: `Category: ${req.category}` }),
          new Paragraph({ text: `Priority: ${req.priority}` }),
          new Paragraph({ text: `Status: ${req.status}` }),
          new Paragraph({ text: `Urgency: ${req.urgency || 'N/A'}` }),
          new Paragraph({ text: `Submitted: ${format(new Date(req.createdDate), 'PPP p')}` }),
          new Paragraph({ text: `Description: ${req.description}` }),
          new Paragraph({ text: "" }),
        ]),
      ],
    }],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `DormFix-Report-${format(new Date(), 'yyyy-MM-dd')}.docx`);
  });
};

export const DashboardClient: FC<DashboardClientProps> = ({ requests: initialRequests }) => {
  const [requests, setRequests] = useState(initialRequests.map(r => ({...r, createdDate: new Date(r.createdDate)})));
  const [filters, setFilters] = useState({
    roomNumber: '',
    category: 'all',
    priority: 'all',
    status: 'all',
  });
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);

  useEffect(() => {
    const runDuplicateDetection = async () => {
      const aiInput = {
        requests: initialRequests.map((r) => ({
          roomNumber: r.roomNumber,
          category: r.category,
          priority: r.priority,
          description: r.description,
          status: r.status,
          createdDate: format(new Date(r.createdDate), "yyyy-MM-dd"),
        })),
      };

      try {
        const { duplicateGroups } = await detectDuplicateRequests(aiInput);
        const allDuplicateIndices = new Set(duplicateGroups.flat());
        const requestsWithDuplicates = initialRequests.map((req, index) => ({
          ...req,
          createdDate: new Date(req.createdDate),
          isDuplicate: allDuplicateIndices.has(index),
        }));
        setRequests(requestsWithDuplicates);
      } catch (error) {
        console.error("Failed to run duplicate detection:", error);
        // Fallback to initial requests if AI call fails
        setRequests(initialRequests.map(r => ({...r, createdDate: new Date(r.createdDate)})));
      }
    };

    runDuplicateDetection();
  }, [initialRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      return (
        (filters.roomNumber === '' || req.roomNumber.includes(filters.roomNumber)) &&
        (filters.category === 'all' || req.category === filters.category) &&
        (filters.priority === 'all' || req.priority === filters.priority) &&
        (filters.status === 'all' || req.status === filters.status)
      );
    });
  }, [requests, filters]);
  
  const stats = useMemo(() => {
    const total = requests.length;
    const urgent = requests.filter(r => r.urgency === 'critical' || r.urgency === 'high').length;
    const statusCounts = requests.reduce((acc, req) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
    }, {} as Record<MaintenanceStatus, number>);
    return { 
      total, 
      urgent, 
      submitted: statusCounts['Submitted'] || 0,
      inProgress: statusCounts['In Progress'] || 0,
      resolved: statusCounts['Resolved'] || 0,
    };
  }, [requests]);

  const categoryData = useMemo(() => {
    const counts = requests.reduce((acc, req) => {
      acc[req.category] = (acc[req.category] || 0) + 1;
      return acc;
    }, {} as Record<MaintenanceCategory, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, count: value }));
  }, [requests]);

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:gap-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                {statusIcons['In Progress']}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.inProgress}</div>
              </CardContent>
          </Card>
          <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolved</CardTitle>
                {statusIcons['Resolved']}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resolved}</div>
              </CardContent>
          </Card>
           <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submitted</CardTitle>
                {statusIcons['Submitted']}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.submitted}</div>
              </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>Requests by Category</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                    cursor={{fill: 'hsl(var(--muted))'}}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
             <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 border border-red-200 dark:bg-red-950 dark:border-red-800">
                    <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                        <p className="text-2xl font-bold">{stats.urgent}</p>
                        <p className="text-sm text-muted-foreground">Urgent/Critical Issues</p>
                    </div>
                </div>
                 <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                    <Copy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                    <div>
                        <p className="text-2xl font-bold">{requests.filter(r => r.isDuplicate).length}</p>
                        <p className="text-sm text-muted-foreground">Potential Duplicates Found</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <CardTitle>Maintenance Requests</CardTitle>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                    <Button onClick={() => generateReport(filteredRequests)} variant="outline">
                        <Download className="mr-2 h-4 w-4" /> Download Report
                    </Button>
                    <Button onClick={() => setIsNewRequestOpen(true)}>
                        <PlusCircle className="mr-2 h-4 w-4" /> New Request
                    </Button>
                </div>
            </div>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Input placeholder="Filter by Room #" value={filters.roomNumber} onChange={e => setFilters({...filters, roomNumber: e.target.value})} />
                <Select value={filters.category} onValueChange={v => setFilters({...filters, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filters.priority} onValueChange={v => setFilters({...filters, priority: v})}>
                    <SelectTrigger><SelectValue placeholder="Filter by Priority" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={v => setFilters({...filters, status: v})}>
                    <SelectTrigger><SelectValue placeholder="Filter by Status" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Room</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Flags</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? filteredRequests.map(req => (
                    <TableRow key={req.id}>
                      <TableCell className="font-medium">{req.roomNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <CategoryIcon category={req.category} className="h-4 w-4 text-muted-foreground" />
                           <span>{req.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.priority === 'High' ? 'destructive' : 'secondary'}>{req.priority}</Badge>
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline">{req.status}</Badge>
                      </TableCell>
                      <TableCell>{format(req.createdDate, 'PPP')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(req.urgency === 'critical' || req.urgency === 'high') && (
                            <UiTooltip>
                              <TooltipTrigger>
                                <ShieldAlert className="h-5 w-5 text-red-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Urgency: {req.urgency}</p>
                              </TooltipContent>
                            </UiTooltip>
                          )}
                           {req.isDuplicate && (
                            <UiTooltip>
                              <TooltipTrigger>
                                <Copy className="h-5 w-5 text-blue-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Potential duplicate request</p>
                              </TooltipContent>
                            </UiTooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No requests found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      <NewRequestDialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen} />
    </TooltipProvider>
  );
};

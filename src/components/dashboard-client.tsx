
'use client';

import { useState, useMemo, FC, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Trash2, Download, Copy, ShieldAlert, BarChart3, ListTodo, Wrench, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';

import { MaintenanceRequest, MaintenanceCategory, MaintenancePriority, MaintenanceStatus, categories, priorities, statuses, hostels, HostelName } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table as UiTable, TableBody, TableCell as UiTableCell, TableHead, TableHeader, TableRow as UiTableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UiTooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CategoryIcon } from './icons';
import { detectDuplicateRequests } from '@/ai/flows/detect-duplicate-requests';
import { Checkbox } from './ui/checkbox';

type MaintenanceRequestWithDate = Omit<MaintenanceRequest, 'createdDate'> & {
    createdDate: Date;
};

interface DashboardClientProps {
  requests: MaintenanceRequest[];
  title?: string;
  userHostel?: HostelName;
  userFloor?: string;
}

const statusIcons: { [key in MaintenanceStatus]: React.ReactNode } = {
  Submitted: <ListTodo className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <Wrench className="h-4 w-4 text-muted-foreground" />,
  Resolved: <CheckCircle2 className="h-4 w-4 text-muted-foreground" />,
};

const generateReport = (requestsToReport: MaintenanceRequestWithDate[]) => {
  const tableHeader = new TableRow({
    children: [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Hostel Name', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Floor', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Room Number', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Category', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Priority', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Description', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] }),
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Created Date', bold: true })] })] }),
    ],
  });

  const tableRows = requestsToReport.map(req => new TableRow({
    children: [
      new TableCell({ children: [new Paragraph(req.hostelName)] }),
      new TableCell({ children: [new Paragraph(req.floor)] }),
      new TableCell({ children: [new Paragraph(req.roomNumber)] }),
      new TableCell({ children: [new Paragraph(req.category)] }),
      new TableCell({ children: [new Paragraph(req.priority)] }),
      new TableCell({ children: [new Paragraph(req.description)] }),
      new TableCell({ children: [new Paragraph(req.status)] }),
      new TableCell({ children: [new Paragraph(format(new Date(req.createdDate), 'PPP p'))] }),
    ],
  }));

  const table = new Table({
    rows: [tableHeader, ...tableRows],
    width: {
        size: 100,
        type: WidthType.PERCENTAGE,
    },
    borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "000000" },
    },
  });

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
        table,
      ],
    }],
  });

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `DormFix-Report-${format(new Date(), 'yyyy-MM-dd')}.docx`);
  });
};

const generateExcelReport = (requestsToReport: MaintenanceRequestWithDate[]) => {
  const worksheetData = requestsToReport.map(req => ({
    'Hostel Name': req.hostelName,
    'Room Number': req.roomNumber,
    Category: req.category,
    Priority: req.priority,
    Description: req.description,
    Status: req.status,
    'Created Date': format(new Date(req.createdDate), 'yyyy-MM-dd HH:mm:ss'),
    'Assigned To': req.assignedTo || 'N/A',
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Requests');

  // Set column widths
  worksheet['!cols'] = [
    { wch: 15 }, // Hostel Name
    { wch: 15 }, // Room Number
    { wch: 15 }, // Category
    { wch: 10 }, // Priority
    { wch: 50 }, // Description
    { wch: 15 }, // Status
    { wch: 20 }, // Created Date
    { wch: 20 }, // Assigned To
  ];

  XLSX.writeFile(workbook, `DormFix-Excel-Report-${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const DashboardClient: FC<DashboardClientProps> = ({ requests: initialRequests }) => {
  const [requests, setRequests] = useState<MaintenanceRequestWithDate[]>([]);
  const [filters, setFilters] = useState({
    roomNumber: '',
    hostelName: 'all',
    floor: '',
    category: 'all',
    priority: 'all',
    status: 'all',
  });
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  useEffect(() => {
    const processRequests = async () => {
      if (!initialRequests || initialRequests.length === 0) {
        setRequests([]);
        return;
      }
      
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
        const { duplicateGroups = [] } = (await detectDuplicateRequests(aiInput)) || {};
        const allDuplicateIndices = new Set(duplicateGroups.flat());
        const requestsWithDates = initialRequests.map((req, index) => ({
          ...req,
          createdDate: new Date(req.createdDate),
          isDuplicate: allDuplicateIndices.has(index),
        }));
        setRequests(requestsWithDates);
      } catch (error) {
        console.error("Failed to run duplicate detection:", error);
        setRequests(initialRequests.map(r => ({...r, createdDate: new Date(r.createdDate)})));
      }
    };

    processRequests();
  }, [initialRequests]);

  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      return (
        (filters.roomNumber === '' || req.roomNumber.includes(filters.roomNumber)) &&
        (filters.hostelName === 'all' || req.hostelName === filters.hostelName) &&
        (filters.floor === '' || req.floor.includes(filters.floor)) &&
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
  
  const handleSelectRequest = (id: string) => {
    setSelectedRequestIds(prev =>
      prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setSelectedRequestIds(filteredRequests.map(req => req.id));
    } else {
      setSelectedRequestIds([]);
    }
  };
  
  const handleRemoveRequests = () => {
    setRequests(prev => prev.filter(req => !selectedRequestIds.includes(req.id)));
    setSelectedRequestIds([]);
  };

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
              <CardDescription>AI-powered insights at a glance.</CardDescription>
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
                <div>
                  <CardTitle>Maintenance Requests</CardTitle>
                  <CardDescription>View, filter, and manage all requests.</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 w-full md:w-auto">
                    <Button onClick={() => generateReport(filteredRequests)} variant="outline">
                        <Download className="mr-2 h-4 w-4" /> DOCX Report
                    </Button>
                    <Button onClick={() => generateExcelReport(filteredRequests)} variant="outline">
                        <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel Report
                    </Button>
                     <Button 
                        onClick={handleRemoveRequests} 
                        variant="destructive"
                        disabled={selectedRequestIds.length === 0}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Request ({selectedRequestIds.length})
                    </Button>
                </div>
            </div>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <Input placeholder="Filter by Room #" value={filters.roomNumber} onChange={e => setFilters({...filters, roomNumber: e.target.value})} />
                <Select value={filters.hostelName} onValueChange={v => setFilters({...filters, hostelName: v})}>
                    <SelectTrigger><SelectValue placeholder="Filter by Hostel" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Hostels</SelectItem>
                        {hostels.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Input placeholder="Filter by Floor #" value={filters.floor} onChange={e => setFilters({...filters, floor: e.target.value})} />
                <Select value={filters.category} onValueChange={v => setFilters({...filters, category: v})}>
                    <SelectTrigger><SelectValue placeholder="Filter by Category" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
              <UiTable>
                <TableHeader>
                  <UiTableRow>
                     <TableHead className="w-[40px]">
                       <Checkbox
                          checked={
                            selectedRequestIds.length > 0 &&
                            selectedRequestIds.length === filteredRequests.length
                          }
                          onCheckedChange={handleSelectAll}
                          aria-label="Select all"
                        />
                    </TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead className="w-[80px]">Floor</TableHead>
                    <TableHead className="w-[100px]">Room</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead className="text-right">Flags</TableHead>
                  </UiTableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.length > 0 ? filteredRequests.map(req => (
                    <UiTableRow key={req.id} data-state={selectedRequestIds.includes(req.id) && 'selected'}>
                       <UiTableCell>
                          <Checkbox
                            checked={selectedRequestIds.includes(req.id)}
                            onCheckedChange={() => handleSelectRequest(req.id)}
                            aria-label={`Select request ${req.id}`}
                          />
                        </UiTableCell>
                       <UiTableCell>{req.hostelName}</UiTableCell>
                       <UiTableCell>{req.floor}</UiTableCell>
                      <UiTableCell className="font-medium">{req.roomNumber}</UiTableCell>
                      <UiTableCell>
                        <div className="flex items-center gap-2">
                           <CategoryIcon category={req.category} className="h-4 w-4 text-muted-foreground" />
                           <span>{req.category}</span>
                        </div>
                      </UiTableCell>
                      <UiTableCell>
                        <Badge variant={req.priority === 'High' ? 'destructive' : 'secondary'}>{req.priority}</Badge>
                      </UiTableCell>
                      <UiTableCell>
                         <Badge variant="outline">{req.status}</Badge>
                      </UiTableCell>
                      <UiTableCell>{format(req.createdDate, 'PPP')}</UiTableCell>
                      <UiTableCell>{req.assignedTo || 'Unassigned'}</UiTableCell>
                      <UiTableCell className="text-right">
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
                      </UiTableCell>
                    </UiTableRow>
                  )) : (
                    <UiTableRow>
                      <UiTableCell colSpan={10} className="text-center">No requests found.</UiTableCell>
                    </UiTableRow>
                  )}
                </TableBody>
              </UiTable>
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
};

    
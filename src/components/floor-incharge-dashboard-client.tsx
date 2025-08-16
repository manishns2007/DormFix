'use client';

import { useState, useMemo, FC } from 'react';
import { Download, PlusCircle } from 'lucide-react';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, BorderStyle } from 'docx';
import { format } from 'date-fns';

import { MaintenanceRequest } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table as UiTable, TableBody, TableCell as UiTableCell, TableHead, TableHeader, TableRow as UiTableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { NewRequestDialog } from '@/components/new-request-dialog';
import { CategoryIcon } from './icons';

interface FloorInchargeDashboardClientProps {
  requests: MaintenanceRequest[];
}

const generateReport = (requestsToReport: MaintenanceRequest[]) => {
  const tableHeader = new TableRow({
    children: [
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
    saveAs(blob, `DormFix-FloorReport-${format(new Date(), 'yyyy-MM-dd')}.docx`);
  });
};


export function FloorInchargeDashboardClient({ requests }: FloorInchargeDashboardClientProps) {
  const [isNewRequestOpen, setIsNewRequestOpen] = useState(false);
  const formattedRequests = useMemo(() => requests.map(r => ({...r, createdDate: new Date(r.createdDate)})), [requests]);

  return (
    <div className="grid gap-4">
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>My Submitted Requests</CardTitle>
                    <div className="flex items-center gap-2">
                        <Button onClick={() => generateReport(formattedRequests)} variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" /> Download Report
                        </Button>
                        <Button onClick={() => setIsNewRequestOpen(true)} size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" /> New Request
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                 <UiTable>
                    <TableHeader>
                    <UiTableRow>
                        <TableHead className="w-[100px]">Room</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                    </UiTableRow>
                    </TableHeader>
                    <TableBody>
                    {formattedRequests.length > 0 ? formattedRequests.map(req => (
                        <UiTableRow key={req.id}>
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
                        </UiTableRow>
                    )) : (
                        <UiTableRow>
                        <UiTableCell colSpan={5} className="text-center">No requests found.</UiTableCell>
                        </UiTableRow>
                    )}
                    </TableBody>
                </UiTable>
            </CardContent>
        </Card>
      <NewRequestDialog open={isNewRequestOpen} onOpenChange={setIsNewRequestOpen} />
    </div>
  );
}

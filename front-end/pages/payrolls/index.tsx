import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, DollarSign, Clock, UserCheck, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import jsPDF from "jspdf";
import "jspdf-autotable";
import emailjs from "emailjs-com";

interface Worker {
  id: number;
  name: string;
  shifts: Shift[];
}

interface Shift {
  id: number;
  worker: number;
  property: {
    propertyId: number;
    clientId: number;
    address: string;
    postalCode: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  status: "COMPLETED" | string;
}

interface PayrollData {
  workerId: number;
  workerName: string;
  regularHours: number;
  overtimeHours: number;
  regularPay: number;
  overtimePay: number;
  totalPay: number;
  shifts: Shift[];
}

const BASE_HOURLY_RATE = 15;
const OVERTIME_HOURLY_RATE = 25;
const WEEKLY_HOUR_LIMIT = 44;

const PayrollManagementPage: React.FC = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState("");
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    fetchWorkers();
  }, []);

  useEffect(() => {
    if (workers.length > 0) {
      calculatePayroll(workers);
    }
  }, [workers, selectedMonth]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const workerIds = user.workers || [];

      const workersData = await Promise.all(
        workerIds.map((id: number) =>
          fetch(`http://localhost:8080/workers/${id}`).then((res) => res.json())
        )
      );

      setWorkers(workersData);
    } catch (error) {
      console.error("Error fetching workers:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePayroll = (workersData: Worker[]) => {
    const payrollInfo = workersData.map((worker) => {
      const filteredShifts = worker.shifts.filter(
        (shift) =>
          shift.status === "COMPLETED" && shift.date.startsWith(selectedMonth)
      );
      let totalHours = 0;

      filteredShifts.forEach((shift) => {
        const start = new Date(`2000-01-01T${shift.startTime}`);
        const end = new Date(`2000-01-01T${shift.endTime}`);
        const shiftHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += shiftHours;
      });

      const regularHours = Math.min(totalHours, WEEKLY_HOUR_LIMIT);
      const overtimeHours = Math.max(0, totalHours - WEEKLY_HOUR_LIMIT);
      const regularPay = regularHours * BASE_HOURLY_RATE;
      const overtimePay = overtimeHours * OVERTIME_HOURLY_RATE;

      return {
        workerId: worker.id,
        workerName: worker.name,
        regularHours,
        overtimeHours,
        regularPay,
        overtimePay,
        totalPay: regularPay + overtimePay,
        shifts: filteredShifts,
      };
    });

    setPayrollData(payrollInfo);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const monthYear = new Date(selectedMonth).toLocaleString("default", {
      month: "long",
      year: "numeric",
    });

    // Title
    doc.setFontSize(20);
    doc.text(`Payroll Report - ${monthYear}`, 15, 20);

    // Summary
    doc.setFontSize(12);
    doc.text(`Total Payroll: $${totalPayroll.toFixed(2)}`, 15, 35);
    doc.text(`Total Workers: ${totalWorkers}`, 15, 42);
    doc.text(`Average Pay: $${averagePay.toFixed(2)}`, 15, 49);

    // Payroll table
    const tableData = payrollData.map((worker) => [
      worker.workerName,
      worker.regularHours.toFixed(2),
      worker.overtimeHours.toFixed(2),
      `$${worker.regularPay.toFixed(2)}`,
      `$${worker.overtimePay.toFixed(2)}`,
      `$${worker.totalPay.toFixed(2)}`,
    ]);

    (doc as any).autoTable({
      startY: 60,
      head: [
        [
          "Worker",
          "Regular Hours",
          "OT Hours",
          "Regular Pay",
          "OT Pay",
          "Total Pay",
        ],
      ],
      body: tableData,
    });

    // Shift details
    let yPos = (doc as any).lastAutoTable.finalY + 20;

    payrollData.forEach((worker) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.text(`${worker.workerName}'s Shifts`, 15, yPos);
      yPos += 10;

      const shiftsData = worker.shifts.map((shift) => [
        shift.date,
        shift.startTime,
        shift.endTime,
        shift.property.address,
        shift.status,
      ]);

      (doc as any).autoTable({
        startY: yPos,
        head: [["Date", "Start Time", "End Time", "Address", "Status"]],
        body: shiftsData,
      });

      yPos = (doc as any).lastAutoTable.finalY + 15;
    });

    return doc.output("blob");
  };

  const handleProcessPayroll = () => {
    if (payrollData.length === 0) {
      setSuccessMessage("No payroll data available for the selected month.");
      setShowSuccessAlert(true);
      setTimeout(() => setShowSuccessAlert(false), 3000);
      return;
    }

    const blob = generatePDF();
    setPdfBlob(blob);
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    if (!email || !pdfBlob) return;

    setSendingEmail(true);
    try {
      // Convert PDF blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);

      reader.onload = async () => {
        const base64Data = reader.result?.toString().split(",")[1];

        await emailjs.send(
          "service_k6ukh8a",
          "template_w91f0wc",
          {
            to_email: email,
            message: `Payroll report for ${selectedMonth}`,
            pdf_attachment: base64Data,
            filename: `payroll-${selectedMonth}.pdf`,
          },
          "nBkme_CQ_uGVex77j"
        );

        setShowEmailDialog(false);
        setSuccessMessage("Payroll report sent successfully!");
        setShowSuccessAlert(true);
        setTimeout(() => setShowSuccessAlert(false), 3000);
      };
    } catch (error) {
      console.error("Error sending email:", error);
      setSuccessMessage("Error sending email. Please try again.");
      setShowSuccessAlert(true);
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const totalPayroll = payrollData.reduce(
    (sum, data) => sum + data.totalPay,
    0
  );
  const totalWorkers = payrollData.length;
  const averagePay = totalWorkers > 0 ? totalPayroll / totalWorkers : 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Payroll Management Dashboard
      </h1>

      <div className="flex justify-end mb-4">
        <Select onValueChange={setSelectedMonth} value={selectedMonth}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => {
              const month = String(i + 1).padStart(2, "0");
              const value = `2024-${month}`;
              const date = new Date(2024, i, 1);
              return (
                <SelectItem key={i} value={value}>
                  {date.toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPayroll.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Workers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Pay</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${averagePay.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Payroll Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead className="text-right">Regular Hours</TableHead>
                  <TableHead className="text-right">Overtime Hours</TableHead>
                  <TableHead className="text-right">Regular Pay</TableHead>
                  <TableHead className="text-right">Overtime Pay</TableHead>
                  <TableHead className="text-right">Total Pay</TableHead>
                  <TableHead className="text-center">View Shifts</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollData.map((data) => (
                  <TableRow
                    key={data.workerId}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {data.workerName}
                    </TableCell>
                    <TableCell className="text-right">
                      {data.regularHours.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {data.overtimeHours.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${data.regularPay.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      ${data.overtimePay.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      ${data.totalPay.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            View Shifts
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>
                              {data.workerName}&apos;s Shifts for{" "}
                              {new Date(selectedMonth).toLocaleString(
                                "default",
                                { month: "long", year: "numeric" }
                              )}
                            </DialogTitle>
                          </DialogHeader>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Start Time</TableHead>
                                <TableHead>End Time</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {data.shifts.map((shift) => (
                                <TableRow key={shift.id}>
                                  <TableCell>{shift.date}</TableCell>
                                  <TableCell>{shift.startTime}</TableCell>
                                  <TableCell>{shift.endTime}</TableCell>
                                  <TableCell>
                                    {shift.property.address}
                                  </TableCell>
                                  <TableCell>
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                      {shift.status}
                                    </span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          onClick={handleProcessPayroll}
          size="lg"
          className="w-full max-w-md"
        >
          Process Payroll
        </Button>
      </div>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Send Payroll Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                onClick={handleSendEmail}
                disabled={!email || sendingEmail}
              >
                {sendingEmail ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Report
              </Button>
            </div>

            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Preview</h3>
              {pdfBlob && (
                <iframe
                  src={URL.createObjectURL(pdfBlob)}
                  className="w-full h-[600px] border rounded"
                  title="Payroll PDF Preview"
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showSuccessAlert && (
        <Alert variant="default" className="mt-4 bg-green-100 border-green-500">
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PayrollManagementPage;

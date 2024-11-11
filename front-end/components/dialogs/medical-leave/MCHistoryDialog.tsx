'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { WorkerData, MedicalLeave } from './types';
import { getMCStatus } from './utils';
import { MCRejectDialog } from './MCRejectDialog';
import { MCTableRow } from './MCTableRow';

interface MCHistoryDialogProps {
  showDialog: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWorker: WorkerData | null;
  onApprovalUpdate: (
    workerId: number,
    leaveId: number,
    approved: boolean
  ) => Promise<void>;
}

export function MCHistoryDialog({
  showDialog,
  onOpenChange,
  selectedWorker,
  onApprovalUpdate,
}: MCHistoryDialogProps) {
  const [showRejectDialog, setShowRejectDialog] = useState<{
    show: boolean;
    leaveId: number | null;
  }>({ show: false, leaveId: null });
  const [updatingLeaves, setUpdatingLeaves] = useState<Record<number, boolean>>({});
  const [localLeaves, setLocalLeaves] = useState<MedicalLeave[]>([]);

  React.useEffect(() => {
    if (showDialog && selectedWorker?.medicalLeaves) {
      setLocalLeaves(selectedWorker.medicalLeaves);
      setUpdatingLeaves({});
    }
  }, [showDialog, selectedWorker?.medicalLeaves]);

  const handleApprovalUpdate = useCallback(
    async (leaveId: number, newApprovalStatus: boolean) => {
      if (!selectedWorker || updatingLeaves[leaveId]) return;

      setUpdatingLeaves((prev) => ({ ...prev, [leaveId]: true }));

      try {
        await onApprovalUpdate(selectedWorker.id, leaveId, newApprovalStatus);
        setLocalLeaves((prevLeaves) =>
          prevLeaves.map((leave) =>
            leave.id === leaveId ? { ...leave, approved: newApprovalStatus } : leave
          )
        );
        onOpenChange(false);
      } catch (error) {
        console.error('Failed to update approval status:', error);
      } finally {
        setShowRejectDialog({ show: false, leaveId: null });
        setUpdatingLeaves((prev) => {
          const newState = { ...prev };
          delete newState[leaveId];
          return newState;
        });
      }
    },
    [selectedWorker, onApprovalUpdate, updatingLeaves, onOpenChange]
  );

  const handleApprove = useCallback(
    (leaveId: number) => {
      void handleApprovalUpdate(leaveId, true);
    },
    [handleApprovalUpdate]
  );

  const handleReject = useCallback(
    (leaveId: number) => {
      if (!updatingLeaves[leaveId]) {
        setShowRejectDialog({ show: true, leaveId });
      }
    },
    [updatingLeaves]
  );

  const handleConfirmReject = useCallback(
    async (leaveId: number) => {
      await handleApprovalUpdate(leaveId, false);
    },
    [handleApprovalUpdate]
  );

  const sortedGroupedLeaves = React.useMemo(() => {
    const leaves = localLeaves.reduce(
      (groups: { [key: string]: typeof localLeaves }, leave) => {
        const date = new Date(leave.startDate);
        const monthYear = date.toLocaleString('default', {
          month: 'long',
          year: 'numeric',
        });

        if (!groups[monthYear]) {
          groups[monthYear] = [];
        }
        groups[monthYear].push(leave);
        return groups;
      },
      {}
    );

    Object.keys(leaves).forEach((monthYear) => {
      leaves[monthYear].sort(
        (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
    });

    return Object.entries(leaves).sort(([monthYearA], [monthYearB]) => {
      const dateA = new Date(monthYearA);
      const dateB = new Date(monthYearB);
      return dateB.getTime() - dateA.getTime();
    });
  }, [localLeaves]);

  return (
    <>
      <Dialog open={showDialog} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Medical Leave Records</DialogTitle>
            <DialogDescription>
              View and manage medical certificates and leave records
            </DialogDescription>
          </DialogHeader>

          {sortedGroupedLeaves.map(([monthYear, monthLeaves]) => (
            <div key={monthYear} className="mb-6">
              <h3 className="font-semibold text-lg mb-3">{monthYear}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Leave Period</TableHead>
                    <TableHead>MC Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthLeaves.map((leave) => {
                    const startDate = new Date(leave.startDate);
                    const endDate = new Date(leave.endDate);
                    const status = getMCStatus(startDate, endDate);
                    const duration =
                      Math.ceil(
                        (endDate.getTime() - startDate.getTime()) /
                          (1000 * 60 * 60 * 24)
                      ) + 1;

                    return (
                      <MCTableRow
                        key={leave.id}
                        leave={leave}
                        status={status}
                        duration={duration}
                        isUpdating={!!updatingLeaves[leave.id]}
                        onReject={handleReject}
                        onApprove={handleApprove}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ))}

          {(!localLeaves || localLeaves.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No medical leave records found.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <MCRejectDialog
        isOpen={showRejectDialog.show}
        leaveId={showRejectDialog.leaveId}
        isUpdating={showRejectDialog.leaveId ? !!updatingLeaves[showRejectDialog.leaveId] : false}
        onClose={() => setShowRejectDialog({ show: false, leaveId: null })}
        onConfirm={handleConfirmReject}
      />
    </>
  );
}
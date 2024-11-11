import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Eye, X, Check } from 'lucide-react';
import { MedicalLeave, MCStatus } from './types';

interface MCTableRowProps {
  leave: MedicalLeave;
  status: MCStatus;
  duration: number;
  isUpdating: boolean;
  onReject: (leaveId: number) => void;
  onApprove: (leaveId: number) => void;
}

export const MCTableRow = ({
  leave,
  status,
  duration,
  isUpdating,
  onReject,
  onApprove,
}: MCTableRowProps) => {
  const startDate = new Date(leave.startDate);
  const endDate = new Date(leave.endDate);

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    
    if (leave.approved) {
      onReject(leave.id);
    } else {
      onApprove(leave.id);
    }
  };

  return (
    <TableRow>
      <TableCell>{format(startDate, 'EEE, d MMM')}</TableCell>
      <TableCell>{format(endDate, 'EEE, d MMM')}</TableCell>
      <TableCell>
        {duration} day{duration !== 1 ? 's' : ''}
      </TableCell>
      <TableCell>
        <Badge className={status.className}>{status.label}</Badge>
      </TableCell>
      <TableCell>
        {leave.medicalCertificate ? (
          <Badge
            className={
              leave.approved
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }
          >
            {leave.approved ? 'APPROVED' : 'REJECTED'}
          </Badge>
        ) : (
          <Badge variant="outline">NO MC</Badge>
        )}
      </TableCell>
      <TableCell>
        <div className="flex items-center justify-center space-x-2">
          {leave.medicalCertificate && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  window.open(leave.medicalCertificate?.presignedUrl, '_blank')
                }
              >
                <Eye className="h-4 w-4 mr-1" /> View MC
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAction}
                disabled={isUpdating}
              >
                {leave.approved ? (
                  <>
                    <X className="h-4 w-4 mr-1" />
                    Reject
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Approve
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
import type { CorrespondenceMessage } from "@/lib/api-client-react-tenant";
import { formatCorrespondenceDateTime } from "@workspace/correspondence-domain";
import {
  correspondenceStatusBadgeClass,
  correspondenceStatusLabel,
} from "@/features/correspondences/correspondence-display";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { CorrespondenceRowActionsMenu } from "@/components/correspondences/CorrespondenceRowActionsMenu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CorrespondencesTableProps {
  messages: CorrespondenceMessage[];
  isLoading: boolean;
  onEdit: (message: CorrespondenceMessage) => void;
  onDelete: (id: number) => void;
  onResend: (message: CorrespondenceMessage) => void;
  isResendPending?: boolean;
}

export function CorrespondencesTable({
  messages,
  isLoading,
  onEdit,
  onDelete,
  onResend,
  isResendPending,
}: CorrespondencesTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[22%]">منشأة العميل</TableHead>
              <TableHead className="w-[26%]">عنوان الرسالة</TableHead>
              <TableHead className="w-[20%]">تاريخ ووقت الإرسال</TableHead>
              <TableHead className="w-[12%]">الحالة</TableHead>
              <TableHead className="w-16 text-center text-black">إجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  لا توجد رسائل مرسلة
                </TableCell>
              </TableRow>
            ) : (
              messages.map((message) => (
                <TableRow key={message.id}>
                  <TableCell className="font-medium align-top">{message.establishmentName}</TableCell>
                  <TableCell className="align-top">{message.subject}</TableCell>
                  <TableCell className="align-top text-muted-foreground">
                    {message.sentAt
                      ? formatCorrespondenceDateTime(message.sentAt)
                      : formatCorrespondenceDateTime(message.createdAt)}
                  </TableCell>
                  <TableCell className="align-top">
                    {message.status === "failed" && message.failureReason ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                "cursor-help",
                                correspondenceStatusBadgeClass(message.status),
                              )}
                            >
                              {correspondenceStatusLabel(message.status)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs text-right">
                            {message.failureReason}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className={correspondenceStatusBadgeClass(message.status)}>
                        {correspondenceStatusLabel(message.status)}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-center align-top">
                    <CorrespondenceRowActionsMenu
                      message={message}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onResend={onResend}
                      isResendPending={isResendPending}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

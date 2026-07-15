import { format } from "date-fns";
import type { OrgUser } from "@/lib/api-client-react-tenant";
import { USER_ROLE_LABELS } from "@workspace/users-domain";
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
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import { UserRowActionsMenu } from "@/components/users/UserRowActionsMenu";
import { ListTableColGroup } from "@/components/ui/list-table-cols";
import type { UserRole } from "@/lib/api-client-react-tenant";

function roleBadgeClass(role: UserRole) {
  if (role === "manager") return "bg-primary/10 text-primary border-primary/20";
  return "bg-purple-500/10 text-purple-600 border-purple-200";
}

function formatUserDate(value: string) {
  return format(new Date(value), "yyyy/MM/dd");
}

interface UsersTableProps {
  users: OrgUser[];
  isLoading: boolean;
  search: string;
  roleFilter: string;
  onEdit: (user: OrgUser) => void;
  onDelete: (id: number) => void;
}

export function UsersTable({
  users,
  isLoading,
  search,
  roleFilter,
  onEdit,
  onDelete,
}: UsersTableProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table className="table-fixed">
          <ListTableColGroup />
          <TableHeader>
            <TableRow>
              <TableHead>المستخدم</TableHead>
              <TableHead>البريد</TableHead>
              <TableHead>الصلاحية</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="text-center text-black">إجراء</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell className="w-16">
                    <div className="flex justify-center">
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                  {search || roleFilter !== "all" ? "لا توجد نتائج" : "لا يوجد مستخدمون"}
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {user.photoUrl ? (
                        <img
                          src={user.photoUrl}
                          alt={user.name}
                          className="h-9 w-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-muted-foreground truncate" dir="ltr">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <div className="flex flex-col items-start gap-0.5 min-w-0">
                      <bdi className="block text-sm font-medium tabular-nums leading-tight">
                        {user.email}
                      </bdi>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={`gap-1 ${roleBadgeClass(user.role)}`}
                    >
                      {user.role === "manager" ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <User className="h-3 w-3" />
                      )}
                      {USER_ROLE_LABELS[user.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="align-top">
                    <bdi className="block text-sm tabular-nums leading-tight">
                      {formatUserDate(user.createdAt)}
                    </bdi>
                  </TableCell>
                  <TableCell className="p-2 align-middle">
                    <div className="flex justify-center">
                      <UserRowActionsMenu user={user} onEdit={onEdit} onDelete={onDelete} />
                    </div>
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

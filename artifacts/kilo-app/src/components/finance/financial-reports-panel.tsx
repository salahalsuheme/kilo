import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { FinancePeriodReport, FinanceReport } from "@/lib/api-client-react-tenant";
import { formatCurrency } from "@workspace/invoices-domain";

type ReportPeriod = "monthly" | "annual";

interface FinancialReportsPanelProps {
  year: number;
  month: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  report: FinanceReport | undefined;
  isLoading: boolean;
}

function MetricCard({
  title,
  value,
  subtitle,
  isLoading,
}: {
  title: string;
  value: string;
  subtitle?: string;
  isLoading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}

const MONTHS = [
  { value: 1, label: "يناير" },
  { value: 2, label: "فبراير" },
  { value: 3, label: "مارس" },
  { value: 4, label: "أبريل" },
  { value: 5, label: "مايو" },
  { value: 6, label: "يونيو" },
  { value: 7, label: "يوليو" },
  { value: 8, label: "أغسطس" },
  { value: 9, label: "سبتمبر" },
  { value: 10, label: "أكتوبر" },
  { value: 11, label: "نوفمبر" },
  { value: 12, label: "ديسمبر" },
];

function PeriodReportCards({
  period,
  currency,
  isLoading,
}: {
  period: FinancePeriodReport | undefined;
  currency: string;
  isLoading: boolean;
}) {
  const expenses = period?.expenses;
  const sales = period?.sales;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">المبيعات</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="إجمالي المبيعات"
            value={formatCurrency(sales?.totalInclVat ?? 0, currency)}
            subtitle="شامل الضريبة"
            isLoading={isLoading}
          />
          <MetricCard
            title="ضريبة المخرجات"
            value={formatCurrency(sales?.outputVat ?? 0, currency)}
            isLoading={isLoading}
          />
          <MetricCard
            title="عدد الفواتير"
            value={String(sales?.count ?? 0)}
            isLoading={isLoading}
          />
          <MetricCard
            title="المبيعات بدون ضريبة"
            value={formatCurrency(sales?.amountExVat ?? 0, currency)}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold mb-3">الضريبة والربحية</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="إجمالي المصروفات"
            value={formatCurrency(expenses?.totalExpensesInclVat ?? 0, currency)}
            subtitle={`شامل الضريبة · مشتريات ${formatCurrency(expenses?.purchasesInclVat ?? 0, currency)} · اشتراكات ${formatCurrency(expenses?.subscriptionsInclVat ?? 0, currency)}`}
            isLoading={isLoading}
          />
          <MetricCard
            title="ضريبة المدخلات"
            value={formatCurrency(period?.inputVat ?? 0, currency)}
            subtitle="مشتريات واشتراكات مدفوعة"
            isLoading={isLoading}
          />
          <MetricCard
            title="صافي ضريبة القيمة المضافة"
            value={formatCurrency(period?.vatPayable ?? 0, currency)}
            subtitle={
              (period?.vatPayable ?? 0) < 0
                ? "رصيد دائن — قابل للترحيل"
                : "المخرجات − المدخلات"
            }
            isLoading={isLoading}
          />
          <MetricCard
            title="صافي الربح"
            value={formatCurrency(period?.netProfit ?? 0, currency)}
            subtitle="المبيعات − المصروفات − صافي الضريبة"
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}

export function FinancialReportsPanel({
  year,
  month,
  onYearChange,
  onMonthChange,
  report,
  isLoading,
}: FinancialReportsPanelProps) {
  const [period, setPeriod] = useState<ReportPeriod>("monthly");
  const currency = report?.currency ?? "SAR";
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const monthLabel = MONTHS.find((m) => m.value === month)?.label ?? "";

  const activePeriod = period === "monthly" ? report?.monthly : report?.annual;
  const periodTitle =
    period === "monthly" ? `${monthLabel} ${year}` : `السنة ${year}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <ToggleGroup
          type="single"
          value={period}
          onValueChange={(value: string) => {
            if (value === "monthly" || value === "annual") setPeriod(value);
          }}
          className="bg-gray-300 rounded-md p-0.5"
        >
          <ToggleGroupItem
            value="monthly"
            className="px-4 min-w-[4.5rem] rounded-sm border-0 bg-transparent text-gray-500 shadow-none hover:bg-transparent hover:text-gray-500 data-[state=on]:bg-white data-[state=on]:text-black data-[state=on]:shadow-sm data-[state=on]:hover:bg-white data-[state=on]:hover:text-black"
          >
            شهري
          </ToggleGroupItem>
          <ToggleGroupItem
            value="annual"
            className="px-4 min-w-[4.5rem] rounded-sm border-0 bg-transparent text-gray-500 shadow-none hover:bg-transparent hover:text-gray-500 data-[state=on]:bg-white data-[state=on]:text-black data-[state=on]:shadow-sm data-[state=on]:hover:bg-white data-[state=on]:hover:text-black"
          >
            سنوي
          </ToggleGroupItem>
        </ToggleGroup>

        <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
          <SelectTrigger className="w-32 bg-white">
            <SelectValue placeholder="السنة" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {period === "monthly" && (
          <Select value={String(month)} onValueChange={(v) => onMonthChange(Number(v))}>
            <SelectTrigger className="w-36 bg-white">
              <SelectValue placeholder="الشهر" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <p className="text-sm text-muted-foreground">ملخص {periodTitle}</p>

      <PeriodReportCards period={activePeriod} currency={currency} isLoading={isLoading} />
    </div>
  );
}

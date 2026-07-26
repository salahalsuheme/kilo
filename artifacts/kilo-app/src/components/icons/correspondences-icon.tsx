import { forwardRef } from "react";
import type { LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

/** أيقونة مراسلات: ظرف بريد مع أسطر نص */
export const CorrespondencesIcon = forwardRef<SVGSVGElement, LucideProps>(
  ({ className, size = 24, ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("lucide lucide-correspondences-icon", className)}
      {...props}
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      <path d="M7 13h6" />
      <path d="M7 16h4" />
    </svg>
  ),
);

CorrespondencesIcon.displayName = "CorrespondencesIcon";

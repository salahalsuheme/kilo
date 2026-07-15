export const USER_ROLES = ["employee", "manager"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  employee: "موظف",
  manager: "مدير",
};

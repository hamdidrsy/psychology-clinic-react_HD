import type { AdminRole } from "@/generated/prisma/enums";

export function canManageArticles(role: AdminRole) {
  return role === "ADMIN" || role === "EDITOR";
}

export function canManageAppointments(role: AdminRole) {
  return role === "ADMIN";
}

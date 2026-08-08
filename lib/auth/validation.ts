import { z } from "zod";

export const adminEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email()
  .max(254);

export const adminPasswordSchema = z
  .string()
  .min(12, "Parola en az 12 karakter olmalıdır.")
  .max(128, "Parola en fazla 128 karakter olabilir.")
  .regex(/[a-zçğıöşü]/u, "Parola en az bir küçük harf içermelidir.")
  .regex(/[A-ZÇĞİÖŞÜ]/u, "Parola en az bir büyük harf içermelidir.")
  .regex(/[0-9]/u, "Parola en az bir rakam içermelidir.");

export const loginSchema = z.object({
  email: adminEmailSchema,
  password: z.string().min(1).max(128),
  next: z.string().optional(),
});

export function safeAdminRedirect(value: string | null | undefined) {
  if (!value || !value.startsWith("/admin") || value.startsWith("//")) {
    return "/admin";
  }
  return value === "/admin/giris" ? "/admin" : value;
}

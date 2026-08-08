import { z } from "zod";

export const articleStatuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

export function slugify(value: string) {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replaceAll("ç", "c")
    .replaceAll("ğ", "g")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ş", "s")
    .replaceAll("ü", "u")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 200);
}

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.url("Geçerli bir URL girin.").max(2048).optional(),
);

export const articleFormSchema = z
  .object({
    title: z.string().trim().min(5).max(180),
    slug: z.string().trim().max(200).optional(),
    excerpt: z.string().trim().min(20).max(500),
    content: z
      .string()
      .trim()
      .min(50, "İçerik en az 50 karakter olmalıdır.")
      .max(100_000)
      .refine(
        (value) => !/<\/?[a-z][^>]*>/i.test(value),
        "Ham HTML kullanılamaz.",
      )
      .refine(
        (value) => !/^#\s+/m.test(value),
        "İçerikte H1 kullanmayın; başlık alanı H1 olacaktır.",
      )
      .refine(
        (value) => !/\]\s*\(\s*(?:javascript|data):/i.test(value),
        "Güvenli olmayan bağlantı kullanılamaz.",
      ),
    coverImageUrl: optionalUrl,
    coverImageAlt: z.string().trim().max(240).optional(),
    metaTitle: z.string().trim().max(70).optional(),
    metaDescription: z.string().trim().max(170).optional(),
    canonicalUrl: optionalUrl,
    socialImageUrl: optionalUrl,
    status: z.enum(articleStatuses),
  })
  .superRefine((value, context) => {
    if (value.coverImageUrl && !value.coverImageAlt) {
      context.addIssue({
        code: "custom",
        path: ["coverImageAlt"],
        message: "Kapak görseli için alt metin zorunludur.",
      });
    }
  });

export type ArticleFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export function articleFormValues(formData: FormData) {
  return {
    title: formData.get("title"),
    slug: formData.get("slug") || undefined,
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    coverImageAlt: formData.get("coverImageAlt") || undefined,
    metaTitle: formData.get("metaTitle") || undefined,
    metaDescription: formData.get("metaDescription") || undefined,
    canonicalUrl: formData.get("canonicalUrl") || undefined,
    socialImageUrl: formData.get("socialImageUrl") || undefined,
    status: formData.get("status"),
  };
}

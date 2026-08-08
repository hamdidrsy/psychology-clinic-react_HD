"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  articleFormSchema,
  type ArticleFormState,
  articleFormValues,
  slugify,
} from "@/lib/admin/article-schema";
import { requireContentManager } from "@/server/auth/session";
import { getDb } from "@/server/db";

function errors(error: Parameters<typeof articleFormSchema.safeParse>[0]) {
  const parsed = articleFormSchema.safeParse(error);
  return parsed.success ? undefined : parsed.error.flatten().fieldErrors;
}

async function uniqueSlug(base: string, articleId?: string) {
  const db = getDb();
  let candidate = base;
  for (let suffix = 2; suffix < 100; suffix += 1) {
    const [existing, oldRedirect] = await Promise.all([
      db.article.findFirst({
        where: {
          slug: candidate,
          ...(articleId ? { id: { not: articleId } } : {}),
        },
        select: { id: true },
      }),
      db.articleSlugRedirect.findUnique({
        where: { oldSlug: candidate },
        select: { articleId: true },
      }),
    ]);
    if (!existing && (!oldRedirect || oldRedirect.articleId === articleId))
      return candidate;
    candidate = `${base}-${suffix}`;
  }
  throw new Error("Benzersiz slug üretilemedi.");
}

export async function createArticle(
  _state: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const admin = await requireContentManager();
  const raw = articleFormValues(formData);
  const parsed = articleFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Alanları kontrol edin.",
      fieldErrors: errors(raw),
    };
  }
  const input = parsed.data;
  const baseSlug = slugify(input.slug || input.title);
  if (!baseSlug)
    return { status: "error", message: "Geçerli bir slug üretilemedi." };
  const slug = await uniqueSlug(baseSlug);
  const now = new Date();
  const article = await getDb().$transaction(async (tx) => {
    const created = await tx.article.create({
      data: {
        ...input,
        slug,
        coverImageUrl: input.coverImageUrl ?? null,
        coverImageAlt: input.coverImageAlt ?? null,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        canonicalUrl: input.canonicalUrl ?? null,
        socialImageUrl: input.socialImageUrl ?? null,
        authorId: admin.id,
        publishedAt: input.status === "PUBLISHED" ? now : null,
        archivedAt: input.status === "ARCHIVED" ? now : null,
      },
    });
    await tx.auditLog.create({
      data: {
        actorAdminId: admin.id,
        action: "ARTICLE_CREATED",
        entityType: "Article",
        entityId: created.id,
        metadata: { status: input.status },
      },
    });
    return created;
  });
  revalidatePath("/admin");
  revalidatePath("/admin/makaleler");
  redirect(`/admin/makaleler/${article.id}?saved=created`);
}

export async function updateArticle(
  articleId: string,
  _state: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const admin = await requireContentManager();
  const raw = articleFormValues(formData);
  const parsed = articleFormSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Alanları kontrol edin.",
      fieldErrors: errors(raw),
    };
  }
  const db = getDb();
  const current = await db.article.findUnique({ where: { id: articleId } });
  if (!current) return { status: "error", message: "Makale bulunamadı." };
  const input = parsed.data;
  const nextSlug = await uniqueSlug(
    slugify(input.slug || input.title),
    articleId,
  );
  const now = new Date();
  await db.$transaction(async (tx) => {
    if (nextSlug !== current.slug) {
      await tx.articleSlugRedirect.upsert({
        where: { oldSlug: current.slug },
        update: { articleId },
        create: { oldSlug: current.slug, articleId },
      });
    }
    await tx.article.update({
      where: { id: articleId },
      data: {
        ...input,
        slug: nextSlug,
        coverImageUrl: input.coverImageUrl ?? null,
        coverImageAlt: input.coverImageAlt ?? null,
        metaTitle: input.metaTitle ?? null,
        metaDescription: input.metaDescription ?? null,
        canonicalUrl: input.canonicalUrl ?? null,
        socialImageUrl: input.socialImageUrl ?? null,
        publishedAt:
          input.status === "PUBLISHED"
            ? (current.publishedAt ?? now)
            : current.publishedAt,
        archivedAt:
          input.status === "ARCHIVED"
            ? (current.archivedAt ?? now)
            : current.archivedAt,
      },
    });
    await tx.auditLog.create({
      data: {
        actorAdminId: admin.id,
        action: "ARTICLE_UPDATED",
        entityType: "Article",
        entityId: articleId,
        metadata: {
          fromStatus: current.status,
          toStatus: input.status,
          slugChanged: nextSlug !== current.slug,
        },
      },
    });
  });
  revalidatePath("/admin");
  revalidatePath("/admin/makaleler");
  redirect(`/admin/makaleler/${articleId}?saved=updated`);
}

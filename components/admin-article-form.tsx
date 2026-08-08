"use client";

import { useActionState } from "react";

import {
  createArticle,
  updateArticle,
} from "@/app/admin/(protected)/makaleler/actions";
import type { ArticleFormState } from "@/lib/admin/article-schema";

type Values = {
  id?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalUrl?: string | null;
  socialImageUrl?: string | null;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
};

const initialState: ArticleFormState = { status: "idle" };

export function AdminArticleForm({ values = {} }: { values?: Values }) {
  const action = values.id
    ? updateArticle.bind(null, values.id)
    : createArticle;
  const [state, formAction, pending] = useActionState(action, initialState);
  const error = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="space-y-7" noValidate>
      {state.message && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      )}
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          error={error("title")}
          label="Başlık"
          name="title"
          required
          value={values.title}
        />
        <Field
          error={error("slug")}
          help="Boş bırakılırsa başlıktan üretilir."
          label="Slug"
          name="slug"
          value={values.slug}
        />
      </div>
      <Area
        error={error("excerpt")}
        label="Özet"
        maxLength={500}
        name="excerpt"
        required
        rows={4}
        value={values.excerpt}
      />
      <Area
        error={error("content")}
        help="Markdown kullanın. Ham HTML kabul edilmez. H1 kullanmayın; sayfa başlığı H1 olacaktır."
        label="İçerik"
        maxLength={100000}
        name="content"
        required
        rows={18}
        value={values.content}
      />
      <div className="grid gap-5 md:grid-cols-2">
        <Field
          error={error("coverImageUrl")}
          label="Kapak görseli URL"
          name="coverImageUrl"
          type="url"
          value={values.coverImageUrl}
        />
        <Field
          error={error("coverImageAlt")}
          help="Görsel varsa zorunludur."
          label="Kapak görseli alt metni"
          name="coverImageAlt"
          value={values.coverImageAlt}
        />
      </div>
      <fieldset className="border-border rounded-2xl border p-5">
        <legend className="px-2 font-bold">SEO ve paylaşım</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            error={error("metaTitle")}
            label="SEO başlığı (70)"
            maxLength={70}
            name="metaTitle"
            value={values.metaTitle}
          />
          <Field
            error={error("canonicalUrl")}
            label="Canonical URL"
            name="canonicalUrl"
            type="url"
            value={values.canonicalUrl}
          />
          <div className="md:col-span-2">
            <Area
              error={error("metaDescription")}
              label="Meta açıklaması (170)"
              maxLength={170}
              name="metaDescription"
              rows={3}
              value={values.metaDescription}
            />
          </div>
          <Field
            error={error("socialImageUrl")}
            label="Sosyal paylaşım görseli URL"
            name="socialImageUrl"
            type="url"
            value={values.socialImageUrl}
          />
        </div>
      </fieldset>
      <div>
        <label className="form-label" htmlFor="status">
          Durum
        </label>
        <select
          className="form-control"
          defaultValue={values.status ?? "DRAFT"}
          id="status"
          name="status"
        >
          <option value="DRAFT">Taslak</option>
          <option value="PUBLISHED">Yayınlandı</option>
          <option value="ARCHIVED">Arşivlendi</option>
        </select>
      </div>
      <div className="flex flex-wrap gap-3">
        <button className="button-primary" disabled={pending} type="submit">
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </button>
        {values.id && (
          <a
            className="button-secondary"
            href={`/admin/makaleler/${values.id}/onizleme`}
            target="_blank"
            rel="noreferrer"
          >
            Güvenli önizleme
          </a>
        )}
      </div>
    </form>
  );
}

function Field({
  error,
  help,
  label,
  name,
  required,
  type = "text",
  value,
  maxLength,
}: {
  error?: string;
  help?: string;
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  value?: string | null;
  maxLength?: number;
}) {
  return (
    <div>
      <label className="form-label" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      {help && <p className="form-help">{help}</p>}
      <input
        aria-invalid={Boolean(error)}
        className="form-control"
        defaultValue={value ?? ""}
        id={name}
        maxLength={maxLength}
        name={name}
        required={required}
        type={type}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

function Area({
  error,
  help,
  label,
  maxLength,
  name,
  required,
  rows,
  value,
}: {
  error?: string;
  help?: string;
  label: string;
  maxLength: number;
  name: string;
  required?: boolean;
  rows: number;
  value?: string | null;
}) {
  return (
    <div>
      <label className="form-label" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      {help && <p className="form-help">{help}</p>}
      <textarea
        aria-invalid={Boolean(error)}
        className="form-control resize-y"
        defaultValue={value ?? ""}
        id={name}
        maxLength={maxLength}
        name={name}
        required={required}
        rows={rows}
      />
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

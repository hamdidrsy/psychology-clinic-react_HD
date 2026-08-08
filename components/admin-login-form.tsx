"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";

import { loginAdmin, type LoginState } from "@/app/admin/actions";

const initialState: LoginState = {};

export function AdminLoginForm() {
  const [state, action, pending] = useActionState(loginAdmin, initialState);
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  return (
    <form action={action} className="space-y-5" noValidate>
      <input name="next" type="hidden" value={next} />
      <div>
        <label className="form-label" htmlFor="admin-email">
          E-posta
        </label>
        <input
          autoComplete="username"
          className="form-control"
          id="admin-email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="form-label" htmlFor="admin-password">
          Parola
        </label>
        <input
          autoComplete="current-password"
          className="form-control"
          id="admin-password"
          maxLength={128}
          name="password"
          required
          type="password"
        />
      </div>
      {state.message && (
        <p
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800"
          role="alert"
        >
          {state.message}
        </p>
      )}
      <button
        className="button-primary w-full"
        disabled={pending}
        type="submit"
      >
        {pending ? "Kontrol ediliyor…" : "Giriş yap"}
      </button>
    </form>
  );
}

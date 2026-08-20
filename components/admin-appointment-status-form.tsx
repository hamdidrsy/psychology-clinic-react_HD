"use client";

import { useActionState, useState } from "react";

import { updateAppointmentStatus } from "@/app/admin/(protected)/randevu-talepleri/actions";
import {
  appointmentStatuses,
  appointmentStatusLabels,
  type AppointmentUpdateState,
} from "@/lib/admin/appointment-schema";

const initialState: AppointmentUpdateState = { status: "idle" };

export function AdminAppointmentStatusForm({
  appointmentId,
  currentStatus,
}: {
  appointmentId: string;
  currentStatus: (typeof appointmentStatuses)[number];
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [state, action, pending] = useActionState(
    updateAppointmentStatus.bind(null, appointmentId),
    initialState,
  );
  return (
    <form
      action={action}
      className="space-y-5"
      onSubmit={(event) => {
        if (
          !confirmed &&
          !window.confirm(
            "Talep durumunu değiştirmek istediğinizden emin misiniz?",
          )
        )
          event.preventDefault();
        else setConfirmed(true);
      }}
    >
      <div>
        <label className="form-label" htmlFor="status">
          Yeni durum
        </label>
        <select
          className="form-control"
          defaultValue={currentStatus}
          id="status"
          name="status"
        >
          {appointmentStatuses.map((status) => (
            <option key={status} value={status}>
              {appointmentStatusLabels[status]}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="form-label" htmlFor="proposedAppointmentAt">
          Önerilen kesin tarih ve saat
        </label>
        <p className="form-help">Talebi onaylarken zorunludur.</p>
        <input
          className="form-control"
          id="proposedAppointmentAt"
          name="proposedAppointmentAt"
          type="datetime-local"
        />
      </div>
      {state.message && (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      )}
      <button className="button-primary" disabled={pending} type="submit">
        {pending ? "Güncelleniyor…" : "Durumu güncelle"}
      </button>
    </form>
  );
}

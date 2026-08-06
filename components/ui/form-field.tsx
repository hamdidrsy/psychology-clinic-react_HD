import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = {
  id: string;
  label: string;
  help?: ReactNode;
  error?: string;
  required?: boolean;
  inputProps?: Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "id" | "required" | "aria-invalid" | "aria-describedby"
  >;
};

export function FormField({
  id,
  label,
  help,
  error,
  required,
  inputProps,
}: FormFieldProps) {
  const describedBy =
    [help ? `${id}-help` : null, error ? `${id}-error` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label className="form-label" htmlFor={id}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      {help && (
        <p className="form-help" id={`${id}-help`}>
          {help}
        </p>
      )}
      <input
        {...inputProps}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className="form-control"
        id={id}
        required={required}
      />
      {error && (
        <p className="form-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

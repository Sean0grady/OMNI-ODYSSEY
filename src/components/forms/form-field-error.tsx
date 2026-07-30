interface FormFieldErrorProps {
  id: string;
  message?: string;
}

export function FormFieldError({ id, message }: FormFieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} role="alert" className="text-xs text-destructive">
      {message}
    </p>
  );
}

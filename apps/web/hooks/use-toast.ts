type ToastProps = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast(props: ToastProps) {
  // This is a simplified toast implementation
  // In a real app, you'd use a toast library or context
  if (props.variant === "destructive") {
    console.error(`[Toast Error] ${props.title}: ${props.description}`);
  } else {
    console.log(`[Toast] ${props.title}: ${props.description}`);
  }

  // For now, we'll also use browser alert as a fallback
  if (typeof window !== "undefined") {
    const message = props.description
      ? `${props.title}\n\n${props.description}`
      : props.title;
    if (props.variant === "destructive") {
      window.alert(`Error: ${message}`);
    } else {
      // For success messages, we'll just log to console
      console.log(message);
    }
  }
}

export function useToast() {
  return { toast };
}

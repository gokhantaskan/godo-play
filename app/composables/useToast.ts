export type ToastType = "success" | "error" | "warning";

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

const TOAST_KEY = Symbol("toast") as InjectionKey<{
  toasts: Ref<Toast[]>;
  show: (message: string, type?: ToastType) => void;
  dismiss: (id: number) => void;
}>;

let nextId = 0;

export function provideToast() {
  const toasts = ref<Toast[]>([]);

  function show(message: string, type: ToastType = "error") {
    const id = nextId++;
    toasts.value.push({ id, message, type });

    setTimeout(() => {
      dismiss(id);
    }, 5000);
  }

  function dismiss(id: number) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  provide(TOAST_KEY, { toasts, show, dismiss });

  return { toasts, show, dismiss };
}

export function useToast() {
  const context = inject(TOAST_KEY);
  if (!context) {
    throw new Error("useToast() requires provideToast() in a parent component");
  }
  return context;
}

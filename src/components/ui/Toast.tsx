// Ruta del archivo: /src/components/ui/Toast.tsx

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fade-in">
      <div className={`rounded-lg px-4 py-3 shadow-lg ${
        type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-4 text-sm font-medium hover:opacity-75"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
  size?: number;
}

export function Spinner({ className, size = 24 }: SpinnerProps) {
  return (
    <Loader2
      size={size}
      className={cn('animate-spin text-brand-olive', className)}
    />
  );
}

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message }: LoadingScreenProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-brand-cream-300" />
        <div className="absolute inset-0 h-12 w-12 rounded-full border-4 border-brand-olive border-t-transparent animate-spin" />
      </div>
      {message && (
        <p className="text-sm text-brand-olive-500 animate-fade-in">{message}</p>
      )}
    </div>
  );
}

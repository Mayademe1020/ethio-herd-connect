import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

interface LoadingButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function LoadingButton({
  isLoading = false,
  loadingText,
  children,
  disabled,
  variant = 'default',
  size = 'default',
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      {...props}
      variant={variant}
      size={size}
      disabled={isLoading || disabled}
      className={props.className}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading ? loadingText || 'እባክዎ ይጠብቁ... / Loading...' : children}
    </Button>
  );
}

import { cn } from '@/lib/utils';
import { forwardRef, HTMLAttributes } from 'react';
//--------------------------------------------------------------------------

type ButtonProps = HTMLAttributes<HTMLButtonElement> & {
  child: React.ReactNode;
  disabled?: boolean;
  className?: string;
  type?: 'submit' | 'button';
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  child,
  disabled,
  type,
  ...props
}, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      disabled={disabled}
      type={type}
      className={cn(
        'relative inline-flex justify-center items-center rounded-button shadow-button bg-[var(--btn-bg)] ring-1 ring-[var(--btn-border)] backdrop-blur-[50px] hover:bg-[var(--btn-hover)] hover:text-primary transition-all text-secondary',
        className
      )}
    >
      {child}
    </button>
  )
});

Button.displayName = 'Button'

export default Button;

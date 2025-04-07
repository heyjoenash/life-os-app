import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

export interface WidgetContainerProps {
  /** Widget title displayed in the header */
  title: string;

  /** Widget content */
  children: ReactNode;

  /** Optional additional class names */
  className?: string;

  /** Optional action element displayed in the header (e.g., button) */
  action?: ReactNode;

  /** Optional loading state */
  isLoading?: boolean;

  /** Optional error message */
  error?: string | null;

  /** Optional minimum height */
  minHeight?: string;
}

/**
 * A generic container for widgets that provides consistent styling
 * and layout for all widgets in the application.
 */
export function WidgetContainer({
  title,
  children,
  className,
  action,
  isLoading = false,
  error = null,
  minHeight,
}: WidgetContainerProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
        className,
      )}
      style={{ minHeight }}
    >
      {/* Widget header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {action && <div>{action}</div>}
      </div>

      {/* Widget content */}
      <div className="p-4">
        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-md mb-4">
            <p>{error}</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="flex space-x-2 items-center">
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        ) : (
          // Actual content
          children
        )}
      </div>
    </div>
  );
}

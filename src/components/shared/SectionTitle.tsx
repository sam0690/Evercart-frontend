import { cn } from '@/lib/utils';

interface SectionTitleProps {
  title: string;
  description?: string;
  className?: string;
}

export function SectionTitle({ title, description, className }: SectionTitleProps) {
  return (
    <div className={cn('mb-8', className)}>
      <h2 className="text-3xl font-bold tracking-tight mb-2">{title}</h2>
      {description && (
        <p className="text-muted-foreground text-lg">{description}</p>
      )}
    </div>
  );
}

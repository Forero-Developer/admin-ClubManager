import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TONE_CLASSES, statusMeta, type StatusMeta, type Tone } from '@/lib/status';

interface BadgeProps {
  tone?: Tone;
  children: ReactNode;
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  title?: string;
}

export function Badge({ tone = 'neutral', children, dot = false, size = 'sm', className, title }: BadgeProps) {
  const t = TONE_CLASSES[tone];
  return (
    <span
      title={title}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        t.badge,
        className,
      )}
    >
      {dot && <span className={cn('h-1.5 w-1.5 rounded-full', t.dot)} />}
      {children}
    </span>
  );
}

/** Badge a partir de un mapa de estados (CLUB_STATUS, PLAYER_STATUS, …). */
export function StatusBadge({
  map,
  value,
  size,
  className,
}: {
  map: Record<string, StatusMeta>;
  value?: string | null;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const meta = statusMeta(map, value);
  return (
    <Badge tone={meta.tone} dot size={size} className={className} title={meta.description}>
      {meta.label}
    </Badge>
  );
}

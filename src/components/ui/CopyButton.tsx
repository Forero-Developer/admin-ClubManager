import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function CopyButton({ value, label = 'Copiar', className }: { value: string; label?: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast.success('Copiado');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('No se pudo copiar');
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={label}
      title={label}
      className={cn('rounded-lg p-1.5 text-text-secondary transition hover:bg-bg hover:text-primary-hover', className)}
    >
      {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
    </button>
  );
}

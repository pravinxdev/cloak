import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";

interface ExpirationIndicatorProps {
  expiresAt?: number;
}

export function ExpirationIndicator({ expiresAt }: ExpirationIndicatorProps) {
  if (!expiresAt) return null;

  const now = Date.now();
  const timeLeft = expiresAt - now;
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

  if (timeLeft < 0) {
    return (
      <div className="flex items-center gap-1 text-red-600 text-xs font-medium">
        <AlertCircle size={14} />
        <span>Expired</span>
      </div>
    );
  }

  if (daysLeft <= 7) {
    return (
      <div className="flex items-center gap-1 text-amber-600 text-xs font-medium">
        <Clock size={14} />
        <span>
          {daysLeft > 0
            ? `${daysLeft}d left`
            : `${hoursLeft}h left`}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
      <CheckCircle2 size={14} />
      <span>{daysLeft}d</span>
    </div>
  );
}

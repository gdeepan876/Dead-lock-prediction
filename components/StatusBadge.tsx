import React from "react";
import { 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  PlayCircle, 
  XCircle, 
  Ban 
} from "lucide-react";

export type BadgeVariant = 
  | 'SAFE'
  | 'UNSAFE'
  | 'RUNNING'
  | 'WAITING'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'APPROVED'
  | 'REJECTED';

interface StatusBadgeProps {
  status: BadgeVariant;
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StatusBadge({ status, text, size = 'md' }: StatusBadgeProps) {
  const configs: Record<BadgeVariant, {
    bg: string;
    border: string;
    text: string;
    icon: React.ElementType;
    defaultLabel: string;
  }> = {
    SAFE: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/40",
      text: "text-emerald-400",
      icon: CheckCircle2,
      defaultLabel: "Safe State (No Deadlock)"
    },
    UNSAFE: {
      bg: "bg-rose-500/15",
      border: "border-rose-500/40",
      text: "text-rose-400",
      icon: AlertTriangle,
      defaultLabel: "Unsafe State (Deadlock Risk)"
    },
    RUNNING: {
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/40",
      text: "text-cyan-400",
      icon: PlayCircle,
      defaultLabel: "Evaluating"
    },
    WAITING: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/40",
      text: "text-amber-400",
      icon: Clock,
      defaultLabel: "Waiting"
    },
    COMPLETED: {
      bg: "bg-teal-500/15",
      border: "border-teal-500/40",
      text: "text-teal-300",
      icon: CheckCircle2,
      defaultLabel: "Finished"
    },
    BLOCKED: {
      bg: "bg-red-500/20",
      border: "border-red-500/50",
      text: "text-red-400",
      icon: Ban,
      defaultLabel: "Blocked"
    },
    APPROVED: {
      bg: "bg-emerald-500/15",
      border: "border-emerald-500/40",
      text: "text-emerald-300",
      icon: CheckCircle2,
      defaultLabel: "Request Approved"
    },
    REJECTED: {
      bg: "bg-rose-500/15",
      border: "border-rose-500/40",
      text: "text-rose-400",
      icon: XCircle,
      defaultLabel: "Request Rejected"
    }
  };

  const config = configs[status] || configs.WAITING;
  const Icon = config.icon;
  const label = text || config.defaultLabel;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs gap-1",
    md: "px-2.5 py-1 text-xs sm:text-sm gap-1.5",
    lg: "px-3.5 py-1.5 text-sm sm:text-base font-semibold gap-2"
  }[size];

  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5"
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bg} ${config.border} ${config.text} ${sizeClasses}`}
    >
      <Icon className={`${iconSizes} flex-shrink-0`} />
      <span>{label}</span>
    </span>
  );
}

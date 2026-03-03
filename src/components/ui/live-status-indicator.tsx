'use client'

import { cva, type VariantProps } from 'class-variance-authority'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { StatusDot, StatusPill } from './status-indicator'

// Status dot indicator - small colored dot for live updates
const liveStatusDotVariants = {
  default: 'bg-muted-foreground',
  active: 'bg-success animate-pulse',
  idle: 'bg-warning',
  error: 'bg-destructive',
  offline: 'bg-muted',
}

// Animated pulse ring for active state
const pulseRingVariants = {
  default: '',
  active: 'bg-success/30 animate-ping',
  idle: '',
  error: 'bg-destructive/30 animate-ping',
  offline: '',
}

// Live indicator badge variant
const liveIndicatorVariants = cva(
  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300',
  {
    variants: {
      status: {
        active: 'bg-success/10 text-success border border-success/20',
        idle: 'bg-warning/10 text-warning border border-warning/20',
        error: 'bg-destructive/10 text-destructive border border-destructive/20',
        offline: 'bg-muted text-muted-foreground border border-muted/20',
      },
      size: {
        sm: 'text-[10px] px-1.5 py-0.5',
        md: 'text-xs px-2 py-1',
        lg: 'text-sm px-3 py-1.5',
      },
    },
    defaultVariants: {
      status: 'idle',
      size: 'md',
    },
  }
)

// Auto-refresh indicator
const refreshIndicatorVariants = cva(
  'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-muted text-muted-foreground',
        primary: 'bg-primary text-primary-foreground',
        success: 'bg-success text-success-foreground',
      },
      showPulse: {
        true: 'animate-pulse',
        false: 'opacity-50',
      },
    },
    defaultVariants: {
      variant: 'default',
      showPulse: false,
    },
  }
)

// Live Status Dot Component with accessibility
export interface LiveStatusDotProps {
  status?: 'active' | 'idle' | 'error' | 'offline'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showPulseRing?: boolean
  className?: string
}

export function LiveStatusDot({
  status = 'idle',
  size = 'md',
  label,
  showPulseRing = false,
  className,
}: LiveStatusDotProps) {
  const dotSizeClass = {
    sm: 'h-1.5 w-1.5',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  }[size]

  return (
    <span 
      className={cn('relative inline-flex items-center', className)}
      aria-live={status === 'active' ? 'assertive' : 'polite'}
      aria-label={label || `${status} status`}
    >
      {showPulseRing && status === 'active' && (
        <span 
          className={cn('absolute inset-0 rounded-full', pulseRingVariants[status])}
          aria-hidden="true"
        />
      )}
      <span 
        className={cn(dotSizeClass, liveStatusDotVariants[status])}
        role="status"
        aria-label={status}
      />
    </span>
  )
}

// Live Status Pill Component
export interface LiveStatusPillProps {
  status?: 'active' | 'idle' | 'error' | 'offline'
  label?: string
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function LiveStatusPill({
  status = 'idle',
  label,
  showIcon = true,
  size = 'md',
  className,
}: LiveStatusPillProps) {
  const statusLabels = {
    active: 'Live Updates',
    idle: 'Paused',
    error: 'Error',
    offline: 'Offline',
  }

  return (
    <span 
      className={cn(liveIndicatorVariants({ status, size }), className)}
      role="status"
      aria-live={status === 'active' ? 'assertive' : 'polite'}
    >
      {showIcon && (
        <LiveStatusDot status={status} size={size === 'sm' ? 'sm' : 'md'} />
      )}
      <span className="capitalize">{label || statusLabels[status]}</span>
    </span>
  )
}

// Auto-refresh Indicator Component
export interface AutoRefreshIndicatorProps {
  isWatching: boolean
  className?: string
}

export function AutoRefreshIndicator({ isWatching, className }: AutoRefreshIndicatorProps) {
  return (
    <div className={cn(refreshIndicatorVariants({
      variant: isWatching ? 'success' : 'default',
      showPulse: isWatching,
    }), className)}
    role="status"
    aria-live="polite"
    aria-label={isWatching ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
    >
      {isWatching ? (
        <>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
          </span>
          <span className="font-medium">Live Updates</span>
        </>
      ) : (
        <>
          <span className="h-2 w-2 opacity-50" />
          <span className="opacity-70">Manual Refresh</span>
        </>
      )}
    </div>
  )
}

// Live Stats Counter Component with accessibility
export interface LiveStatsCounterProps {
  label: string
  value: number
  change?: number
  trend?: 'up' | 'down' | 'stable'
  className?: string
}

export function LiveStatsCounter({
  label,
  value,
  change,
  trend = 'stable',
  className,
}: LiveStatsCounterProps) {
  const trendColors = {
    up: 'text-success',
    down: 'text-destructive',
    stable: 'text-muted-foreground',
  }

  return (
    <div className={cn('p-4 bg-muted rounded-lg transition-colors duration-300', className)}
      role="status"
      aria-live="polite"
    >
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-foreground">{value}</div>
        {change !== undefined && (
          <div className={cn('text-sm font-medium', trendColors[trend])}>
            {change > 0 ? '+' : ''}{change}
          </div>
        )}
      </div>
    </div>
  )
}

// Live Indicator Card Component
export interface LiveIndicatorCardProps {
  title: string
  status: 'active' | 'idle' | 'error' | 'offline'
  lastUpdate?: string
  onToggle?: (enabled: boolean) => void
  isWatching: boolean
  children?: React.ReactNode
  className?: string
}

export function LiveIndicatorCard({
  title,
  status,
  lastUpdate,
  onToggle,
  isWatching,
  children,
  className,
}: LiveIndicatorCardProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <LiveStatusDot status={status} size="lg" showPulseRing={status === 'active'} />
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </div>
        {onToggle && (
          <button
            onClick={() => onToggle(!isWatching)}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-muted hover:bg-muted/80 transition-colors"
            aria-pressed={isWatching}
            aria-label={isWatching ? 'Stop watching' : 'Start watching'}
          >
            {isWatching ? 'Stop' : 'Watch'}
          </button>
        )}
      </div>
      
      {children}
      
      {lastUpdate && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Last updated:</span>
          <time dateTime={lastUpdate}>{new Date(lastUpdate).toLocaleTimeString()}</time>
        </div>
      )}
    </div>
  )
}

'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Select variants
const selectTriggerVariants = cva(
  'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
  {
    variants: {
      variant: {
        default: '',
        error: 'border-destructive focus:ring-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// Select Context
interface SelectContextValue {
  open: boolean
  setOpen: (open: boolean) => void
  value: string
  setValue: (value: string) => void
  disabled: boolean
}

const SelectContext = React.createContext<SelectContextValue | null>(null)

// Select Root
interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  defaultValue?: string
  disabled?: boolean
  children: React.ReactNode
}

export function Select({
  value: controlledValue,
  onValueChange,
  defaultValue = '',
  disabled = false,
  children,
}: SelectProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue)
  const [open, setOpen] = React.useState(false)
  
  const value = controlledValue ?? uncontrolledValue
  const setValue = (newValue: string) => {
    if (!controlledValue) {
      setUncontrolledValue(newValue)
    }
    onValueChange?.(newValue)
    setOpen(false)
  }

  return (
    <SelectContext.Provider value={{ open, setOpen, value, setValue, disabled }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  )
}

// Select Trigger
interface SelectTriggerProps 
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof selectTriggerVariants> {}

export function SelectTrigger({ 
  className, 
  variant,
  children, 
  id,
  ...props 
}: SelectTriggerProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectTrigger must be used within Select')
  
  const { open, setOpen, disabled, value } = context
  const triggerRef = React.useRef<HTMLButtonElement>(null)

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
    if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-haspopup="listbox"
      aria-disabled={disabled}
      disabled={disabled}
      id={id}
      className={cn(selectTriggerVariants({ variant, className }))}
      onClick={() => !disabled && setOpen(!open)}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
      <svg
        className="h-4 w-4 opacity-50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

// Select Value
interface SelectValueProps {
  placeholder?: string
}

export function SelectValue({ placeholder = 'Select...' }: SelectValueProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectValue must be used within Select')
  
  const { value } = context
  
  return (
    <span className={cn(!value && 'text-muted-foreground')}>
      {value || placeholder}
    </span>
  )
}

// Select Content
interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectContent({ className, children, ...props }: SelectContentProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectContent must be used within Select')
  
  const { open, setOpen, setValue } = context
  const contentRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>()

  // Handle escape and outside click
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (contentRef.current && !contentRef.current.contains(e.target as Node)) {
        const trigger = document.querySelector('[aria-haspopup="listbox"]')
        if (trigger && !trigger.contains(e.target as Node)) {
          setOpen(false)
        }
      }
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, setOpen])

  // Focus management
  React.useEffect(() => {
    if (open && contentRef.current) {
      const firstItem = contentRef.current.querySelector('[role="option"]') as HTMLElement
      firstItem?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      ref={contentRef}
      role="listbox"
      className={cn(
        'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95',
        open ? 'opacity-100' : 'opacity-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// Select Item
interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  disabled?: boolean
}

export function SelectItem({ 
  value, 
  disabled = false, 
  className, 
  children,
  ...props 
}: SelectItemProps) {
  const context = React.useContext(SelectContext)
  if (!context) throw new Error('SelectItem must be used within Select')
  
  const { value: selectedValue, setValue } = context
  const isSelected = selectedValue === value

  const handleClick = () => {
    if (!disabled) {
      setValue(value)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
    if (e.key === 'ArrowDown') {
      const next = e.currentTarget.nextElementSibling as HTMLElement
      next?.focus()
    }
    if (e.key === 'ArrowUp') {
      const prev = e.currentTarget.previousElementSibling as HTMLElement
      prev?.focus()
    }
  }

  return (
    <div
      role="option"
      aria-selected={isSelected}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground',
        'aria-selected:bg-accent aria-selected:text-accent-foreground',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      {children}
    </div>
  )
}

// Select Label
interface SelectLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectLabel({ className, ...props }: SelectLabelProps) {
  return (
    <div 
      className={cn('px-2 py-1.5 text-sm font-semibold text-muted-foreground', className)} 
      {...props} 
    />
  )
}

// Select Separator
interface SelectSeparatorProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectSeparator({ className, ...props }: SelectSeparatorProps) {
  return (
    <div className={cn('-mx-1 my-1 h-px bg-muted', className)} {...props} />
  )
}

// Select Group
interface SelectGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SelectGroup({ className, children, ...props }: SelectGroupProps) {
  return (
    <div role="group" className={cn('p-1', className)} {...props}>
      {children}
    </div>
  )
}
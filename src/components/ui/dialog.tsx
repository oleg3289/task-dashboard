'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Dialog Root
interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({ open: false, setOpen: () => {} })

export function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const open = controlledOpen ?? uncontrolledOpen
  const setOpen = (value: boolean) => {
    setUncontrolledOpen(value)
    onOpenChange?.(value)
  }

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

// Dialog Trigger
interface DialogTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

export function DialogTrigger({ 
  children, 
  asChild, 
  onClick,
  ...props 
}: DialogTriggerProps) {
  const { setOpen } = React.useContext(DialogContext)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true)
    onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: typeof handleClick }>, {
      onClick: handleClick,
    })
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

// Dialog Portal
interface DialogPortalProps {
  children: React.ReactNode
}

export function DialogPortal({ children }: DialogPortalProps) {
  const { open } = React.useContext(DialogContext)
  
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {children}
    </div>
  )
}

// Dialog Overlay
interface DialogOverlayProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogOverlay({ className, ...props }: DialogOverlayProps) {
  const { setOpen } = React.useContext(DialogContext)

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/80 backdrop-blur-sm',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      onClick={() => setOpen(false)}
      data-state="open"
      {...props}
    />
  )
}

// Dialog Content
interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DialogContent({ 
  className, 
  children, 
  ...props 
}: DialogContentProps) {
  const { setOpen } = React.useContext(DialogContext)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [setOpen])

  // Focus trap
  React.useEffect(() => {
    contentRef.current?.focus()
  }, [])

  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
        className={cn(
          'fixed z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg',
          'sm:rounded-lg',
          'animate-in fade-in-0 zoom-in-95',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2',
          'data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]',
          'duration-200',
          className
        )}
        data-state="open"
        {...props}
      >
        {children}
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </DialogPortal>
  )
}

// Dialog Header
export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)}
      {...props}
    />
  )
}

// Dialog Footer
export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className
      )}
      {...props}
    />
  )
}

// Dialog Title
export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

// Dialog Description
export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
}
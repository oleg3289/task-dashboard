'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

const TabsContext = React.createContext<{
  activeTab: string
  setActiveTab: (tab: string) => void
} | null>(null)

interface TabsProps {
  defaultValue: string
  className?: string
  children: React.ReactNode
}

export function Tabs({ defaultValue, className, children }: TabsProps) {
  const [activeTab, setActiveTab] = React.useState(defaultValue)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  )
}

interface TabsListProps {
  className?: string
  children: React.ReactNode
}

export function TabsList({ className, children }: TabsListProps) {
  return (
    <div 
      className={cn(
        'flex items-center justify-start w-full border-b border-border',
        className
      )}
      role="tablist"
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsTrigger({ value, className, children }: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  
  if (!context) {
    throw new Error('TabsTrigger must be used within a Tabs component')
  }

  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      aria-selected={isActive}
      className={cn(
        'px-4 py-2 text-sm font-medium transition-colors',
        'border-b-2 border-transparent',
        'hover:text-foreground/80',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        isActive 
          ? 'text-primary border-primary' 
          : 'text-muted-foreground hover:border-muted',
        className
      )}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  )
}

interface TabsContentProps {
  value: string
  className?: string
  children: React.ReactNode
}

export function TabsContent({ value, className, children }: TabsContentProps) {
  const context = React.useContext(TabsContext)
  
  if (!context) {
    throw new Error('TabsContent must be used within a Tabs component')
  }

  const { activeTab } = context
  
  if (activeTab !== value) {
    return null
  }

  return (
    <div 
      className={cn('pt-4', className)} 
      role="tabpanel"
    >
      {children}
    </div>
  )
}
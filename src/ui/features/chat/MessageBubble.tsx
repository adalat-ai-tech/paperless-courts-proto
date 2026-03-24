import { cn } from '../../lib/utils'
import type { Message, CurrentUser } from './types'

interface MessageBubbleProps {
  message: Message
  currentUser: CurrentUser
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Today'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday'
  }
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function MessageBubble({ message, currentUser }: MessageBubbleProps) {
  const isOwnMessage = message.senderType === currentUser.type
  const senderLabel = isOwnMessage
    ? 'You'
    : message.senderDesignation
      ? `${message.senderName}, ${message.senderDesignation}`
      : message.senderName

  return (
    <div
      className={cn(
        'flex flex-col max-w-[80%] gap-1',
        isOwnMessage ? 'ml-auto items-end' : 'mr-auto items-start'
      )}
    >
      <span className="text-xs text-muted-foreground px-1">{senderLabel}</span>
      <div
        className={cn(
          'rounded-lg px-3 py-2 text-sm',
          isOwnMessage
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
      <span className="text-[10px] text-muted-foreground px-1">
        {formatTime(message.createdAt)}
      </span>
    </div>
  )
}

export function SystemMessage({ message }: { message: Message }) {
  const icon = message.metadata?.icon ?? '\u2139\uFE0F'

  return (
    <div className="flex items-center justify-center my-3">
      <div className="flex items-center gap-2 rounded-full bg-muted/50 border border-border px-4 py-2 max-w-[85%]">
        <span className="text-sm">{icon}</span>
        <span className="text-xs text-muted-foreground">{message.content}</span>
        <span className="text-[10px] text-muted-foreground/70">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  )
}

export function DateSeparator({ date }: { date: string }) {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded">
        {formatDate(date)}
      </span>
    </div>
  )
}

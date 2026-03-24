import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import type { Message, CurrentUser } from './types'
import { MessageBubble, DateSeparator, SystemMessage } from './MessageBubble'

interface MessageListProps {
  messages: Message[]
  currentUser: CurrentUser
  isLoading?: boolean
  className?: string
}

function groupMessagesByDate(messages: Message[]): Map<string, Message[]> {
  const groups = new Map<string, Message[]>()

  messages.forEach((message) => {
    const date = new Date(message.createdAt).toDateString()
    const existing = groups.get(date) || []
    groups.set(date, [...existing, message])
  })

  return groups
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-muted-foreground"
        >
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      </div>
      <p className="text-sm text-muted-foreground">No messages yet</p>
      <p className="text-xs text-muted-foreground mt-1">
        Start a conversation about this filing
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex items-center gap-2 text-muted-foreground">
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <span className="text-sm">Loading messages...</span>
      </div>
    </div>
  )
}

export function MessageList({
  messages,
  currentUser,
  isLoading,
  className,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const messageGroups = groupMessagesByDate(messages)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages.length])

  if (isLoading) {
    return <LoadingState />
  }

  if (messages.length === 0) {
    return <EmptyState />
  }

  return (
    <div
      ref={scrollRef}
      className={cn('flex-1 overflow-y-auto p-4 space-y-4', className)}
    >
      {Array.from(messageGroups.entries()).map(([date, dateMessages]) => (
        <div key={date}>
          <DateSeparator date={dateMessages[0].createdAt} />
          <div className="space-y-3">
            {dateMessages.map((message) =>
              message.messageType === 'system' ? (
                <SystemMessage key={message.id} message={message} />
              ) : (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                />
              )
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

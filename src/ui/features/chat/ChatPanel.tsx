import { cn } from '../../lib/utils'
import type { ChatPanelProps } from './types'
import { MessageList } from './MessageList'
import { ChatInput } from './ChatInput'

export function ChatPanel({
  filingNumber,
  currentUser,
  otherParty,
  messages,
  onSendMessage,
  isLoading,
  isSending,
  className,
}: ChatPanelProps) {
  const otherPartyLabel =
    otherParty.type === 'advocate' ? 'Advocate' : 'Scrutiny Officer'

  return (
    <div
      className={cn(
        'flex flex-col bg-background border rounded-lg shadow-lg overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium">Inbox</h3>
            <p className="text-xs text-muted-foreground">{filingNumber}</p>
          </div>
        </div>
      </div>

      {/* Participant info */}
      <div className="px-4 py-2 border-b bg-muted/10 text-xs text-muted-foreground">
        <span>
          Conversation with{' '}
          <span className="font-medium text-foreground">
            {otherParty.name || otherPartyLabel}
          </span>
        </span>
      </div>

      {/* Messages */}
      <MessageList
        messages={messages}
        currentUser={currentUser}
        isLoading={isLoading}
        className="flex-1 bg-muted/5"
      />

      {/* Input */}
      <ChatInput onSend={onSendMessage} isSending={isSending} />
    </div>
  )
}

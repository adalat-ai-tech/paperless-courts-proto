export interface SystemMessageMetadata {
  event?: string
  icon?: string
  [key: string]: unknown
}

export interface Message {
  id: string
  filingId: string
  senderType: 'advocate' | 'court-staff' | 'system'
  senderId: string
  senderName: string
  senderDesignation?: string
  content: string
  createdAt: string
  originMessageId?: string
  messageType: 'chat' | 'system'
  metadata?: SystemMessageMetadata
}

export interface CurrentUser {
  id: string
  name: string
  type: 'advocate' | 'court-staff' | 'system'
}

export interface OtherParty {
  name: string
  type: 'advocate' | 'court-staff' | 'system'
}

export interface ChatPanelProps {
  filingId: string
  filingNumber: string
  currentUser: CurrentUser
  otherParty: OtherParty
  messages: Message[]
  onSendMessage: (content: string) => void
  isLoading?: boolean
  isSending?: boolean
  className?: string
}

export type CampaignStatus = 'draft' | 'sending' | 'sent' | 'failed'

export interface Campaign {
  id: string
  name: string
  subject: string
  body: string
  status: CampaignStatus
  templateId?: string
  fromName?: string
  fromDomain?: string
  totalRecipients: number
  sentCount: number
  failedCount: number
  openedCount: number
  sentAt?: string
  createdAt: string
  updatedAt: string
}

export interface SendLog {
  id: string
  email: string
  status: 'sent' | 'failed'
  error?: string
  resendId?: string
  openedAt?: string
  openCount: number
  sentAt: string
  recipient?: Recipient
}

export interface Recipient {
  id: string
  name: string
  email: string
  tags: string[]
  isActive: boolean
  createdAt: string
}

export interface Template {
  id: string
  name: string
  subject: string
  body: string
  createdAt: string
}

export interface DashboardMetrics {
  totalSent: number
  totalCampaigns: number
  avgOpenRate: number
  avgDeliveryRate: number
  recentCampaigns: Campaign[]
}
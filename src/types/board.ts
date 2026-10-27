import type { Platform } from './post'

export type BoardColumnId = 'ideas' | 'in_progress' | 'review' | 'done'

export interface BoardCard {
  id: string
  title: string
  note?: string
  columnId: BoardColumnId
  platform: Platform | 'general'
  createdAt: string
}

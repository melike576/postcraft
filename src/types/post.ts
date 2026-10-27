export type Platform = 'instagram' | 'linkedin' | 'twitter'

export type PostStatus = 'draft' | 'scheduled' | 'published'

export interface Post {
  id: string
  content: string
  imageUrl?: string
  platform: Platform
  status: PostStatus
  createdAt: string
  updatedAt?: string
  scheduledAt?: string
}


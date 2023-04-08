import type { IUser } from './IUser'

export interface IComment {
  id: number | null
  parentId: number | null
  content: string
  createdAt: string | null
  score: number
  user: IUser
  [key: string]: any
}

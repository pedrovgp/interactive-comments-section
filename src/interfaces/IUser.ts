export interface IUser {
  id?: number | string | null
  image?: string | null
  username?: string
  email?: string
  [key: string]: any
}

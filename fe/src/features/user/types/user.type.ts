export type UserSearchResult = {
  _id: string
  fullName: string
  phone: string
  email: string
}

export type UserSearchResponse = {
  success: boolean
  data: UserSearchResult[]
}

export const getAuthorizationHeader = (token: string) => {
  return {
    Authorization: 'Bearer ' + token,
  }
}

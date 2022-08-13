export const encode = (str: string): string => {
  return btoa(btoa(str).split('').reverse().join(''))
}

export const decode = (str: string): string => {
  return atob(atob(str).split('').reverse().join(''))
}

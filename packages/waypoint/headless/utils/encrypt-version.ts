export const isEncryptV2 = (encryptedKey: string): boolean => {
  return encryptedKey.indexOf(".") !== -1
}

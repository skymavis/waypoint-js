export type BaseParams = {
  httpUrl: string
  waypointToken: string
}

export type EncryptedPasswordParams = {
  ciphertextB64: string
  clientEncryptedKeyB64: string
  nonceB64: string
}

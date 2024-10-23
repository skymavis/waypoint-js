import { _HeadlessClient, type _OverrideLockboxOpts } from "./headless-client"
import { _defaultShardStorage, type ClientShardStorage } from "./shard-storage"

export type CreateHeadlessClientOpts = _OverrideLockboxOpts & {
  storage?: ClientShardStorage
}

export const createHeadlessClient = (opts: CreateHeadlessClientOpts) => {
  const { storage, ...override } = opts
  return new _HeadlessClient(override, storage ?? _defaultShardStorage)
}

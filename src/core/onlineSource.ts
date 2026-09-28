import { getSongListSetting } from '@/utils/data'

export const ONLINE_SOURCES: LX.OnlineSource[] = ['kw', 'kg', 'tx', 'wy', 'mg']

let currentSource: LX.OnlineSource = 'kw'
let initialized = false

export const initOnlineSource = () => {
  if (initialized) return
  initialized = true
  void getSongListSetting().then(info => {
    if (info.source && ONLINE_SOURCES.includes(info.source as LX.OnlineSource)) {
      const source = info.source as LX.OnlineSource
      if (source != currentSource) {
        currentSource = source
        global.state_event.onlineSourceUpdated(source)
      }
    }
  }).catch(() => {})
}

export const getActiveSource = () => currentSource

export const setActiveSource = (source: LX.OnlineSource) => {
  if (currentSource == source) return
  currentSource = source
  global.state_event.onlineSourceUpdated(source)
}

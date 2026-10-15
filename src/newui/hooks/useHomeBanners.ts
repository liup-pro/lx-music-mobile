import { useMemo } from 'react'

import type { BannerItem } from '@/newui/components'
import { getPlatformMeta, NEW_UI_HOME_BANNER_KEYS } from '@/newui/const'

import { useApiSourceName } from './useApiSourceName'
import { useNowPlaying } from './useNowPlaying'

/** 当前音源能取到地址的平台（global.lx.qualityList 由播放初始化写入，这里只读） */
const coveredSources = (): LX.OnlineSource[] => {
  const qualityList = global.lx.qualityList
  return (Object.keys(qualityList) as LX.OnlineSource[]).filter(
    source => (qualityList[source]?.length ?? 0) > 0,
  )
}

/** 平台名的顿号串，如「QQ音乐、网易云、酷我音乐」 */
const joinPlatformNames = (sources: LX.OnlineSource[]): string =>
  sources.map(source => getPlatformMeta(source).label).join('、')

/**
 * 首页轮播的条目（原型 BANNERS 是三段写死的 mock，这里全部换成真实状态）：
 * 1. 音源公告 —— 当前音源决定了哪些平台的歌能取到地址；
 * 2. 正在播放 —— 只有在放歌时才出现，报曲名与歌手；
 * 3. 随手听 —— 电台在原型里就标注「建设中」，保持占位。
 * 点击动作由首页分派（浮层类功能还没做，先给提示）。
 */
export const useHomeBanners = (): BannerItem[] => {
  // 内置音源表在本项目为空，实际都指向用户导入的音源脚本，名字统一走 useApiSourceName
  const apiName = useApiSourceName()
  const nowPlaying = useNowPlaying()

  return useMemo(() => {
    const covered = coveredSources()
    const items: BannerItem[] = [
      {
        key: NEW_UI_HOME_BANNER_KEYS.apiSource,
        tag: '音源公告',
        title: apiName ? `当前音源 ${apiName}` : '当前音源还没选好',
        // 原型 app.js L159-161：可获取的说法是「音乐内容可获取」，不说「取到地址」（开发术语）
        sub: covered.length
          ? `${joinPlatformNames(covered)} 的音乐内容可获取`
          : '当前音源还没有报出可播的平台',
        artSeed: 'banner-api',
      },
    ]
    if (nowPlaying.hasSong) {
      items.push({
        key: NEW_UI_HOME_BANNER_KEYS.nowPlaying,
        tag: nowPlaying.playing ? '正在播放' : '暂停中',
        title: nowPlaying.title,
        sub: nowPlaying.album ? `${nowPlaying.singer} · ${nowPlaying.album}` : nowPlaying.singer,
        // 2026-10-12 走查现象 2：正在播放卡铺在放曲目的真封面（播放核心已带 pic）；
        // 平台没给封面图时才退回专辑名种子的渐变纹理
        artSeed: `album:${nowPlaying.album || nowPlaying.title}`,
        imageUri: nowPlaying.picUrl ?? undefined,
      })
    }
    items.push({
      key: NEW_UI_HOME_BANNER_KEYS.radio,
      tag: '随手听',
      title: '电台',
      sub: '按口味随机播放 · 建设中',
      artSeed: 'banner-radio',
    })
    return items
  }, [
    apiName,
    nowPlaying.album,
    nowPlaying.hasSong,
    nowPlaying.picUrl,
    nowPlaying.playing,
    nowPlaying.singer,
    nowPlaying.title,
  ])
}

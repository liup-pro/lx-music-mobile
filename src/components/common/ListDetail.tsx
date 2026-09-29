import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { Animated, Easing, View } from 'react-native'

import OnlineList, { type OnlineListType, type OnlineListProps } from '@/components/OnlineList'
import PageContent from '@/components/PageContent'
import StatusBar from '@/components/common/StatusBar'
import PlayerBar from '@/components/player/PlayerBar'
import Text from '@/components/common/Text'
import Button from '@/components/common/Button'
import { Icon } from '@/components/common/Icon'
import BoardTile from '@/components/common/BoardTile'
import Image from '@/components/common/Image'
import { useTheme } from '@/store/theme/hook'
import { useListCollected } from '@/store/list/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { BorderWidths } from '@/theme'
import { scaleSizeW } from '@/utils/pixelRatio'
import { useStatusbarHeight } from '@/store/common/hook'
import { pop } from '@/navigation'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'

const IMAGE_WIDTH = scaleSizeW(70)

export interface ListDetailHeaderInfo {
  id: string
  name: string
  source: LX.OnlineSource
  desc?: string
  author?: string
  playCount?: string
  img?: string
}

export interface ListDetailPageResult {
  list: LX.Music.MusicInfoOnline[]
  ended: boolean
  meta?: {
    desc?: string
    playCount?: string
    img?: string
  }
}

/** 数据来源适配器：歌单详情 / 榜单详情各自注入自己的取数与动作实现 */
export interface ListDetailAdapter {
  loadPage: (id: string, source: LX.OnlineSource, page: number, isRefresh: boolean) => Promise<ListDetailPageResult>
  playList: (id: string, source: LX.OnlineSource, list: LX.Music.MusicInfoOnline[] | undefined, index: number) => void
  collect: (id: string, source: LX.OnlineSource, name: string) => void
}

export interface ListDetailProps {
  componentId: string
  info: ListDetailHeaderInfo
  sourceListId: string
  adapter: ListDetailAdapter
  playerBarIsHome?: boolean
  checkHomePagerIdle?: boolean
}

export interface ListDetailType {
  loadList: (source: LX.OnlineSource, id: string) => void
}

interface DetailHeaderProps {
  info: ListDetailHeaderInfo
  meta?: ListDetailPageResult['meta']
  componentId: string
  isCollected: boolean
  onPlayAll: () => void
  onCollect: () => void
}

const DetailHeader = ({ info, meta, componentId, isCollected, onPlayAll, onCollect }: DetailHeaderProps) => {
  const theme = useTheme()
  const t = useI18n()
  const statusBarHeight = useStatusbarHeight()
  const heartScale = useRef(new Animated.Value(1)).current
  const img = meta?.img ?? info.img
  const playCount = meta?.playCount ?? info.playCount
  const desc = meta?.desc ?? info.desc
  const statLine = [playCount, info.author].filter(Boolean).join(' · ')
  const collectColor = isCollected ? theme['c-primary'] : theme['c-button-font']

  const back = () => {
    void pop(componentId)
  }

  // 收藏按钮按下时心形弹性缩放反馈，同时触发上层收藏逻辑
  const handleCollectPress = () => {
    heartScale.setValue(1)
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.35,
        duration: 130,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start()
    onCollect()
  }

  return (
    <View style={{ ...styles.container, paddingTop: statusBarHeight, borderBottomColor: theme['c-border-background'] }}>
      <View style={styles.info}>
        {
          img ? (
            <View style={styles.picWrap}>
              <Image nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_to_${info.id}`} url={img} style={styles.pic} />
            </View>
          ) : (
            <BoardTile id={info.id} name={info.name} size={IMAGE_WIDTH} radius={8} centered labelSize={Math.round(IMAGE_WIDTH * .16)} />
          )
        }
        <View style={styles.textBox} nativeID={NAV_SHEAR_NATIVE_IDS.songlistDetail_title}>
          <Text size={16} numberOfLines={2} style={styles.name}>{info.name}</Text>
          {
            statLine ? <Text size={12} color={theme['c-font-label']} numberOfLines={1} style={styles.stat}>{statLine}</Text> : null
          }
          {
            desc ? <Text size={12} color={theme['c-font-label']} numberOfLines={2} style={styles.desc}>{desc}</Text> : null
          }
        </View>
      </View>
      <View style={styles.actions}>
        <Button onPress={handleCollectPress} style={styles.actionBtn}>
          <View style={styles.actionInner}>
            <Animated.View style={[styles.iconWrap, { transform: [{ scale: heartScale }] }]}>
              <Icon name="love" size={13} color={collectColor} />
            </Animated.View>
            <Text size={13} color={collectColor} style={styles.actionText}>{t(isCollected ? 'collected' : 'collect')}</Text>
          </View>
        </Button>
        <Button onPress={onPlayAll} style={styles.actionBtn}>
          <View style={styles.actionInner}>
            <Icon name="play-outline" size={13} color={theme['c-button-font']} />
            <Text size={13} color={theme['c-button-font']} style={styles.actionText}>{t('play_all')}</Text>
          </View>
        </Button>
        <Button onPress={back} style={styles.actionBtn}>
          <View style={styles.actionInner}>
            <Icon name="chevron-left" size={13} color={theme['c-button-font']} />
            <Text size={13} color={theme['c-button-font']} style={styles.actionText}>{t('back')}</Text>
          </View>
        </Button>
      </View>
    </View>
  )
}

/** 歌单/榜单详情共享页面组件：封面 + 标题统计 + 操作栏 + OnlineList 歌曲列表 */
export default forwardRef<ListDetailType, ListDetailProps>(({ componentId, info, sourceListId, adapter, playerBarIsHome, checkHomePagerIdle }, ref) => {
  const listRef = useRef<OnlineListType>(null)
  const listDataRef = useRef<LX.Music.MusicInfoOnline[]>([])
  const pageRef = useRef(1)
  const isUnmountedRef = useRef(false)
  const [meta, setMeta] = useState<ListDetailPageResult['meta']>(undefined)
  const isCollected = useListCollected(info.source, sourceListId)

  useEffect(() => {
    isUnmountedRef.current = false
    return () => {
      isUnmountedRef.current = true
    }
  }, [])

  const applyResult = (result: ListDetailPageResult, page: number, append: boolean) => {
    if (isUnmountedRef.current) return
    listDataRef.current = result.list
    pageRef.current = page
    listRef.current?.setList(result.list, append)
    listRef.current?.setStatus(result.ended ? 'end' : 'idle')
    if (result.meta) setMeta(result.meta)
  }

  useImperativeHandle(ref, () => ({
    loadList(source, id) {
      listRef.current?.setStatus('loading')
      void adapter.loadPage(id, source, 1, false)
        .then(result => { applyResult(result, 1, false) })
        .catch(() => {
          if (!isUnmountedRef.current) listRef.current?.setStatus('error')
        })
    },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [])

  const handlePlayList: OnlineListProps['onPlayList'] = (index) => {
    adapter.playList(info.id, info.source, listDataRef.current, index)
  }
  const handleRefresh: OnlineListProps['onRefresh'] = () => {
    listRef.current?.setStatus('refreshing')
    void adapter.loadPage(info.id, info.source, 1, true)
      .then(result => { applyResult(result, 1, false) })
      .catch(() => {
        if (!isUnmountedRef.current) listRef.current?.setStatus('error')
      })
  }
  const handleLoadMore: OnlineListProps['onLoadMore'] = () => {
    listRef.current?.setStatus('loading')
    const page = listDataRef.current.length ? pageRef.current + 1 : 1
    void adapter.loadPage(info.id, info.source, page, false)
      .then(result => { applyResult(result, page, true) })
      .catch(() => {
        if (!isUnmountedRef.current) listRef.current?.setStatus('error')
      })
  }

  const handlePlayAll = () => {
    adapter.playList(info.id, info.source, listDataRef.current, 0)
  }
  const handleCollect = () => {
    adapter.collect(info.id, info.source, info.name)
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const header = useMemo(() => (
    <DetailHeader info={info} meta={meta} componentId={componentId} isCollected={isCollected} onPlayAll={handlePlayAll} onCollect={handleCollect} />
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [info, meta, isCollected])

  return (
    <PageContent>
      <StatusBar />
      <OnlineList
        ref={listRef}
        onPlayList={handlePlayList}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        ListHeaderComponent={header}
        checkHomePagerIdle={checkHomePagerIdle}
      />
      <PlayerBar isHome={playerBarIsHome} />
    </PageContent>
  )
})

const styles = createStyle({
  container: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    borderBottomWidth: BorderWidths.normal,
  },
  info: {
    flexDirection: 'row',
    padding: 10,
  },
  picWrap: {
    flexGrow: 0,
    flexShrink: 0,
    width: IMAGE_WIDTH,
    height: IMAGE_WIDTH,
    overflow: 'hidden',
  },
  pic: {
    flex: 1,
    borderRadius: 8,
  },
  textBox: {
    flexGrow: 1,
    flexShrink: 1,
    paddingLeft: 10,
    justifyContent: 'center',
  },
  name: {
    fontWeight: '700',
  },
  stat: {
    paddingTop: 4,
  },
  desc: {
    paddingTop: 4,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
    flexGrow: 0,
    flexShrink: 0,
  },
  actionBtn: {
    flexGrow: 1,
    flexShrink: 1,
    width: '33%',
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 10,
    paddingRight: 10,
  },
  actionInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    marginLeft: 4,
  },
})

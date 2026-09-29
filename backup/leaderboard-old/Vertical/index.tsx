import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { createStyle } from '@/utils/tools'

import MusicList, { type MusicListType } from '../MusicList'
import { getLeaderboardSetting, saveLeaderboardSetting } from '@/utils/data'
import HeaderBar, { type HeaderBarType, type HeaderBarProps } from './HeaderBar'
import BoardTiles from './BoardTiles'
import Text from '@/components/common/Text'
import boardState, { type BoardItem } from '@/store/leaderboard/state'
import { getBoardsList } from '@/core/leaderboard'
import { handleCollect, handlePlay } from '../listAction'
import { getActiveSource, initOnlineSource } from '@/core/onlineSource'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'


export default () => {
  const theme = useTheme()
  const t = useI18n()
  const musicListRef = useRef<MusicListType>(null)
  const headerBarRef = useRef<HeaderBarType>(null)
  const isUnmountedRef = useRef(false)
  const boardsRef = useRef<BoardItem[]>([])
  const currentRef = useRef<{ source: LX.OnlineSource, id: string, name: string }>({ source: 'kw', id: '', name: '' })
  const savedBoardIdRef = useRef<string | null>(null)
  const [boards, setBoards] = useState<BoardItem[]>([])
  const [activeId, setActiveId] = useState('')

  const selectBoard = (source: LX.OnlineSource, board: BoardItem) => {
    currentRef.current = { source, id: board.id, name: board.name }
    setActiveId(board.id)
    headerBarRef.current?.setBound(board.name)
    musicListRef.current?.loadList(source, board.id)
    void saveLeaderboardSetting({ source, boardId: board.id })
  }

  const loadSource = (source: LX.OnlineSource) => {
    void getBoardsList(source).then(list => {
      if (isUnmountedRef.current || !list.length) return
      boardsRef.current = list
      setBoards(list)
      const saved = savedBoardIdRef.current ? list.find(b => b.id == savedBoardIdRef.current) : null
      selectBoard(source, saved ?? list[0]!)
    }).catch(() => {})
  }

  const handleSelect = (id: string) => {
    const board = boardsRef.current.find(b => b.id == id)
    if (!board) return
    selectBoard(currentRef.current.source, board)
  }

  const onPlay: HeaderBarProps['onPlay'] = () => {
    if (!currentRef.current.id) return
    void handlePlay(currentRef.current.id, boardState.listDetailInfo.list)
  }
  const onCollect: HeaderBarProps['onCollect'] = () => {
    if (!currentRef.current.id) return
    void handleCollect(currentRef.current.id, currentRef.current.name, currentRef.current.source)
  }

  useEffect(() => {
    isUnmountedRef.current = false
    initOnlineSource()
    void getLeaderboardSetting().then(({ boardId }) => {
      savedBoardIdRef.current = boardId
      loadSource(getActiveSource())
    })

    const handleOnlineSourceUpdated = (source: LX.OnlineSource) => {
      loadSource(source)
    }
    global.state_event.on('onlineSourceUpdated', handleOnlineSourceUpdated)

    return () => {
      global.state_event.off('onlineSourceUpdated', handleOnlineSourceUpdated)
      isUnmountedRef.current = true
    }
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.desc} size={13} color={theme['c-font-label']}>{t('toplist_desc')}</Text>
      <BoardTiles items={boards} activeId={activeId} onSelect={handleSelect} />
      <View style={{ ...styles.card, backgroundColor: theme['c-button-background'] }}>
        <HeaderBar ref={headerBarRef} onPlay={onPlay} onCollect={onCollect} />
        <MusicList ref={musicListRef} />
      </View>
    </View>
  )
}

const styles = createStyle({
  container: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    paddingTop: 12,
  },
  desc: {
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  card: {
    flex: 1,
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    overflow: 'hidden',
  },
})

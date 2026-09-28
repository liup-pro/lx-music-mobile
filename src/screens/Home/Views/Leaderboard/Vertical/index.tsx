import { useEffect, useRef, useState } from 'react'
import { View } from 'react-native'
import { createStyle } from '@/utils/tools'

import MusicList, { type MusicListType } from '../MusicList'
import { getLeaderboardSetting, saveLeaderboardSetting } from '@/utils/data'
import HeaderBar, { type HeaderBarType, type HeaderBarProps } from './HeaderBar'
import ChipBar, { type ChipItem } from '@/components/common/ChipBar'
import boardState, { type BoardItem } from '@/store/leaderboard/state'
import { getBoardsList } from '@/core/leaderboard'
import { handleCollect, handlePlay } from '../listAction'
import { getActiveSource, initOnlineSource } from '@/core/onlineSource'
import { useTheme } from '@/store/theme/hook'


export default () => {
  const theme = useTheme()
  const musicListRef = useRef<MusicListType>(null)
  const headerBarRef = useRef<HeaderBarType>(null)
  const isUnmountedRef = useRef(false)
  const boardsRef = useRef<BoardItem[]>([])
  const currentRef = useRef<{ source: LX.OnlineSource, id: string, name: string }>({ source: 'kw', id: '', name: '' })
  const savedBoardIdRef = useRef<string | null>(null)
  const [chips, setChips] = useState<ChipItem[]>([])
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
      setChips(list.map(b => ({ id: b.id, name: b.name })))
      const saved = savedBoardIdRef.current ? list.find(b => b.id == savedBoardIdRef.current) : null
      selectBoard(source, saved ?? list[0]!)
    }).catch(() => {})
  }

  const handleChipSelect = (id: string) => {
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
      <HeaderBar ref={headerBarRef} onPlay={onPlay} onCollect={onCollect} />
      <ChipBar items={chips} activeId={activeId} onSelect={handleChipSelect} />
      <View style={{ ...styles.card, backgroundColor: theme['c-button-background'] }}>
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
  },
  card: {
    flex: 1,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
  },
})

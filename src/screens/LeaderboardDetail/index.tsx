import { useEffect, useRef } from 'react'
import { View } from 'react-native'

import Header, { type HeaderProps } from './Header'
import MusicList, { type MusicListType } from '@/screens/Home/Views/Leaderboard/MusicList'
import { handleCollect, handlePlay } from '@/screens/Home/Views/Leaderboard/listAction'
import boardState from '@/store/leaderboard/state'
import PageContent from '@/components/PageContent'
import StatusBar from '@/components/common/StatusBar'
import PlayerBar from '@/components/player/PlayerBar'
import { setComponentId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'

export interface LeaderboardDetailProps {
  componentId: string
  info: { source: LX.OnlineSource, id: string, name: string }
}

export default ({ componentId, info }: LeaderboardDetailProps) => {
  const theme = useTheme()
  const musicListRef = useRef<MusicListType>(null)

  useEffect(() => {
    setComponentId(COMPONENT_IDS.leaderboardDetail, componentId)
    musicListRef.current?.loadList(info.source, info.id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onPlay: HeaderProps['onPlay'] = () => {
    void handlePlay(info.id, boardState.listDetailInfo.list)
  }
  const onCollect: HeaderProps['onCollect'] = () => {
    void handleCollect(info.id, info.name, info.source)
  }

  return (
    <PageContent>
      <StatusBar />
      <Header name={info.name} onPlay={onPlay} onCollect={onCollect} />
      <View style={{ ...styles.card, backgroundColor: theme['c-button-background'] }}>
        <MusicList ref={musicListRef} />
      </View>
      <PlayerBar isHome />
    </PageContent>
  )
}

const styles = createStyle({
  card: {
    flex: 1,
    marginHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
})

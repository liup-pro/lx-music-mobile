import { memo } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { createStyle } from '@/utils/tools'
import Text from './Text'
import { Icon } from './Icon'
import { getBoardColors } from './BoardTile'

export interface BoardCardProps {
  id: string
  name: string
  index: number
  width: number
  height?: number
  onPress: () => void
}

/** 榜单大卡片：渐变底 + 底部压暗 + 序号角标 + 播放按钮 */
export default memo(({ id, name, index, width, height, onPress }: BoardCardProps) => {
  const [c1, c2] = getBoardColors(id)
  const h = height ?? Math.round(width * .82)
  return (
    <TouchableOpacity activeOpacity={.85} onPress={onPress}>
      <View style={{ ...styles.card, width, height: h, backgroundColor: c1 }}>
        <View style={{ ...styles.blob, width: h * 1.5, height: h * 1.5, borderRadius: h, left: -h * .35, top: -h * .62, backgroundColor: c2 }} />
        <View style={{ ...styles.blob, width: h * .9, height: h * .9, borderRadius: h, right: -h * .3, bottom: -h * .5, backgroundColor: '#fff' }} />
        <View style={{ ...styles.scrim2, width, height: h * .62 }} />
        <View style={{ ...styles.scrim, width, height: h * .34 }} />
        <View style={{ ...styles.rank, backgroundColor: 'rgba(255,255,255,0.26)' }}>
          <Text size={10} color="#fff" style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.footer}>
          <Text size={16} color="#fff" numberOfLines={2} style={styles.name}>{name}</Text>
          <View style={{ ...styles.play, width: h * .22, height: h * .22 }}>
            <Icon name="play" size={Math.round(h * .1)} color={c1} style={styles.playIcon} />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
})

const styles = createStyle({
  card: {
    overflow: 'hidden',
    borderRadius: 20,
    justifyContent: 'flex-end',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  blob: {
    position: 'absolute',
    opacity: 0.32,
  },
  scrim2: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.14)',
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.24)',
  },
  rank: {
    position: 'absolute',
    top: 10,
    left: 10,
    borderRadius: 8,
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: 'center',
  },
  rankText: {
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 12,
  },
  name: {
    flex: 1,
    fontWeight: '800',
    lineHeight: 20,
    marginRight: 8,
  },
  play: {
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    marginLeft: 1,
  },
})

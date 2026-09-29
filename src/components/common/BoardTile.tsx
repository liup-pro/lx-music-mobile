import { View } from 'react-native'
import { createStyle } from '@/utils/tools'
import Text from './Text'

export interface BoardTileProps {
  id: string
  name: string
  size: number
  radius?: number
  active?: boolean
  activeColor?: string
  labelSize?: number
  centered?: boolean
}

const PALETTE = [
  ['#667EEA', '#764BA2'],
  ['#11998E', '#38EF7D'],
  ['#FC466B', '#3F5EFB'],
  ['#F7971E', '#FFD200'],
  ['#8E2DE2', '#4A00E0'],
  ['#00C9FF', '#92FE9D'],
  ['#F857A6', '#FF5858'],
  ['#1FA2FF', '#A6FFCB'],
  ['#B91D73', '#F953C6'],
  ['#0083B0', '#00B4DB'],
]

const hashId = (id: string) => {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) & 0x7fffffff
  return hash
}

export const getBoardColors = (id: string) => PALETTE[hashId(id) % PALETTE.length]

export default ({ id, name, size, radius = 16, active, activeColor, labelSize = 13, centered }: BoardTileProps) => {
  const [c1, c2] = getBoardColors(id)
  return (
    <View style={{ ...styles.tile, width: size, height: size, borderRadius: radius, backgroundColor: c1, borderColor: active ? activeColor ?? '#fff' : 'transparent' }}>
      <View style={{ ...styles.blob, width: size * 1.5, height: size * 1.5, borderRadius: size, left: -size * 0.4, top: -size * 0.55, backgroundColor: c2 }} />
      <View style={{ ...styles.blob2, width: size * 1.1, height: size * 1.1, borderRadius: size, right: -size * 0.4, bottom: -size * 0.6, backgroundColor: c2 }} />
      {
        centered ? (
          <View style={styles.center}>
            <Text size={labelSize + 4} color="#fff" numberOfLines={2} style={styles.centerText}>{name}</Text>
          </View>
        ) : (
          <View style={styles.bottom}>
            <Text size={labelSize} color="#fff" numberOfLines={2} style={styles.text}>{name}</Text>
          </View>
        )
      }
    </View>
  )
}

const styles = createStyle({
  tile: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
    borderWidth: 2,
  },
  blob: {
    position: 'absolute',
    opacity: 0.45,
  },
  blob2: {
    position: 'absolute',
    opacity: 0.3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  bottom: {
    padding: 10,
  },
  text: {
    fontWeight: '700',
  },
  centerText: {
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.25)',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 1 },
  },
})

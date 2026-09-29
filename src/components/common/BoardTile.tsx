import { View } from 'react-native'
import { createStyle } from '@/utils/tools'
import { MaterialColors } from '@/theme'
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

// 同色系「中调 -> 深调」双色调组合，明暗主题下白字均有足够对比度
const PALETTE: Array<[string, string]> = [
  [MaterialColors.blue[500], MaterialColors.blue[800]],
  [MaterialColors.purple[500], MaterialColors.purple[800]],
  [MaterialColors.green[500], MaterialColors.green[800]],
  [MaterialColors.red[500], MaterialColors.red[800]],
  [MaterialColors.orange[600], MaterialColors.orange[900]],
  [MaterialColors.blue[400], MaterialColors.purple[700]],
  [MaterialColors.green[600], MaterialColors.blue[900]],
  [MaterialColors.brown[500], MaterialColors.brown[800]],
  [MaterialColors.orange[500], MaterialColors.red[800]],
  [MaterialColors.grey[600], MaterialColors.grey[900]],
]

export const hashId = (id: string) => {
  let hash = 0
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) & 0x7fffffff
  return hash
}

export const getBoardColors = (id: string): [string, string] => PALETTE[hashId(id) % PALETTE.length]

export default ({ id, name, size, radius = 16, active, activeColor, labelSize = 13, centered }: BoardTileProps) => {
  const [c1, c2] = getBoardColors(id)
  return (
    <View style={{ ...styles.tile, width: size, height: size, borderRadius: radius, backgroundColor: c1, borderColor: active ? activeColor ?? '#fff' : 'transparent' }}>
      <View style={{ ...styles.blob, width: size * 1.5, height: size * 1.5, borderRadius: size, left: -size * 0.4, top: -size * 0.55, backgroundColor: c2 }} />
      <View style={{ ...styles.blob2, width: size * 1.1, height: size * 1.1, borderRadius: size, right: -size * 0.4, bottom: -size * 0.6, backgroundColor: c2 }} />
      <View style={{ ...styles.scrim, width: size, height: size * .55 }} />
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
    opacity: 0.4,
  },
  blob2: {
    position: 'absolute',
    opacity: 0.26,
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.16)',
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

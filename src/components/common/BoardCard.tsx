import { memo } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from './Text'
import { Icon } from './Icon'
import { getBoardColors, hashId } from './BoardTile'

export interface BoardCardProps {
  id: string
  name: string
  index: number
  width: number
  height?: number
  onPress: () => void
}

const VARIANT_COUNT = 5

/** 按榜单 id 哈希确定性选取卡片样式，同一榜单每次渲染样式一致 */
export const getBoardCardVariant = (id: string): number => hashId(`${id}#v`) % VARIANT_COUNT

/** 取一组与主色不同的辅助色（用于拼贴等变体） */
const getAccentColors = (id: string): [string, string] => getBoardColors(`${id}::accent`)

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
})

interface CardBodyProps extends Omit<BoardCardProps, 'height'> {
  variant: number
  height: number
}

// 变体 a：深色渐变底 + 巨大半透明序号数字排版（数字做背景元素）
const BigNumCard = ({ id, name, index, width, height }: CardBodyProps) => {
  const [c1, c2] = getBoardColors(id)
  const h = height
  const numSize = Math.round(h * .58)
  return (
    <View style={{ ...styles.card, width, height: h, backgroundColor: c2 }}>
      <View style={{ ...styles.blob, width: h * 1.6, height: h * 1.6, borderRadius: h, left: -h * .4, top: -h * .7, backgroundColor: c1 }} />
      <Text size={numSize} color="rgba(255,255,255,0.16)" style={{ ...styles.bigNum, lineHeight: Math.round(numSize * 1.12), top: -Math.round(numSize * .16) }}>{index + 1}</Text>
      <View style={{ ...styles.scrim2, width, height: h * .6 }} />
      <View style={{ ...styles.scrim, width, height: h * .34 }} />
      <View style={styles.footer}>
        <Text size={15} color="#fff" numberOfLines={2} style={styles.name}>{name}</Text>
        <View style={styles.indexRow}>
          <View style={{ ...styles.indexBar, backgroundColor: c1 }} />
          <Text size={10} color="rgba(255,255,255,0.72)" style={styles.indexText}>NO.{index + 1}</Text>
        </View>
      </View>
    </View>
  )
}

// 变体 b：浅色卡片（跟随主题）+ 左侧彩色渐变竖条 + 深色标题
const LightBarCard = ({ id, name, index, width, height }: CardBodyProps) => {
  const theme = useTheme()
  const [c1, c2] = getBoardColors(id)
  const h = height
  const barW = Math.max(6, Math.round(h * .05))
  return (
    <View style={{ ...styles.card, width, height: h, backgroundColor: theme['c-button-background'], borderColor: theme['c-border-background'] }}>
      <View style={{ ...styles.lightBar, width: barW, top: 0, height: h * .55, backgroundColor: c1, borderBottomRightRadius: barW * 2 }} />
      <View style={{ ...styles.lightBar, width: barW, bottom: 0, height: h * .55, backgroundColor: c2, borderTopLeftRadius: 0, borderTopRightRadius: 0, borderBottomLeftRadius: barW }} />
      <View style={{ ...styles.lightBarGlow, width: barW + 6, bottom: 0, height: h * .3, backgroundColor: c2 }} />
      <Text size={11} color={theme['c-font-label']} style={styles.lightIndex}>NO.{index + 1}</Text>
      <View style={{ ...styles.lightFooter, paddingLeft: barW + 12 }}>
        <Text size={15} color={theme['c-font']} numberOfLines={2} style={styles.name}>{name}</Text>
        <View style={{ ...styles.lightArrow, width: Math.round(h * .2), height: Math.round(h * .2), backgroundColor: c1 }}>
          <Icon name="chevron-right-2" size={Math.round(h * .09)} color="#fff" />
        </View>
      </View>
    </View>
  )
}

// 变体 c：封面拼贴式，右侧错落倾斜彩色小方块模拟封面堆叠
const CollageCard = ({ id, name, width, height }: CardBodyProps) => {
  const [c1, c2] = getBoardColors(id)
  const [a1, a2] = getAccentColors(id)
  const h = height
  const s1 = Math.round(h * .4)
  const s2 = Math.round(h * .32)
  const s3 = Math.round(h * .26)
  return (
    <View style={{ ...styles.card, width, height: h, backgroundColor: c1 }}>
      <View style={{ ...styles.blob, width: h * 1.4, height: h * 1.4, borderRadius: h, right: -h * .5, top: -h * .7, backgroundColor: c2 }} />
      <View style={{ ...styles.collageTile, width: s1, height: s1, right: Math.round(width * .08), top: Math.round(h * .1), backgroundColor: a1, transform: [{ rotate: '6deg' }] }} />
      <View style={{ ...styles.collageTile, width: s2, height: s2, right: Math.round(width * .28), top: Math.round(h * .3), backgroundColor: a2, transform: [{ rotate: '-8deg' }] }} />
      <View style={{ ...styles.collageTile, width: s3, height: s3, right: Math.round(width * .04), top: Math.round(h * .46), backgroundColor: c2, transform: [{ rotate: '12deg' }] }} />
      <View style={{ ...styles.scrim2, width, height: h * .55 }} />
      <View style={{ ...styles.scrim, width, height: h * .3 }} />
      <View style={styles.footer}>
        <Text size={15} color="#fff" numberOfLines={2} style={styles.name}>{name}</Text>
        <View style={{ ...styles.play, width: Math.round(h * .24), height: Math.round(h * .24) }}>
          <Icon name="play" size={Math.round(h * .11)} color={c1} style={styles.playIcon} />
        </View>
      </View>
    </View>
  )
}

// 变体 d：单色浓底 + 大号标题左下排版 + 右上角环形装饰
const MonoCard = ({ id, name, index, width, height }: CardBodyProps) => {
  const [c1, c2] = getBoardColors(id)
  const h = height
  const ring = Math.round(h * .26)
  return (
    <View style={{ ...styles.card, width, height: h, backgroundColor: c2 }}>
      <View style={{ ...styles.monoTint, width: h * 1.2, height: h * 1.2, borderRadius: h, left: -h * .4, bottom: -h * .6, backgroundColor: c1 }} />
      <View style={{ ...styles.ring, width: ring, height: ring, borderRadius: Math.round(ring / 2), top: 10, right: 10, borderColor: c1 }}>
        <View style={{ ...styles.ringDot, width: Math.round(ring * .28), height: Math.round(ring * .28), borderRadius: Math.round(ring * .14), backgroundColor: c1 }} />
      </View>
      <Text size={10} color="rgba(255,255,255,0.6)" style={styles.monoIndex}>NO.{index + 1}</Text>
      <View style={styles.monoFooter}>
        <Text size={16} color="#fff" numberOfLines={2} style={styles.monoName}>{name}</Text>
        <View style={{ ...styles.monoUnderline, width: Math.round(width * .22), backgroundColor: c1 }} />
      </View>
    </View>
  )
}

// 变体 e：渐变描边（外实线环 + 内圈半透明环）+ 居中两行标题
const OutlineCard = ({ id, name, width, height }: CardBodyProps) => {
  const [c1, c2] = getBoardColors(id)
  const h = height
  const ring = Math.round(h * .62)
  return (
    <View style={{ ...styles.card, width, height: h, backgroundColor: c2, borderWidth: 1.5, borderColor: c1 }}>
      <View style={{ ...styles.outlineFill, width: width - 3, height: h - 3, backgroundColor: c2 }}>
        <View style={{ ...styles.innerRing, width: ring, height: ring, borderRadius: Math.round(ring / 2) }} />
        <View style={{ ...styles.innerRing2, width: Math.round(ring * .78), height: Math.round(ring * .78), borderRadius: Math.round(ring * .39) }} />
        <View style={styles.outlineCenter}>
          <Text size={14} color="#fff" numberOfLines={2} style={styles.outlineName}>{name}</Text>
          <View style={{ ...styles.outlineDot, backgroundColor: c1 }} />
        </View>
      </View>
    </View>
  )
}

/** 榜单大卡片：按 board.id 哈希在 5 套样式中确定性选取，外框尺寸完全一致 */
export default memo(({ id, name, index, width, height, onPress }: BoardCardProps) => {
  const h = height ?? Math.round(width * .82)
  const variant = getBoardCardVariant(id)
  const bodyProps = { id, name, index, width, height: h, variant, onPress }
  return (
    <TouchableOpacity activeOpacity={.85} onPress={onPress}>
      {
        variant == 0 ? <BigNumCard {...bodyProps} />
          : variant == 1 ? <LightBarCard {...bodyProps} />
            : variant == 2 ? <CollageCard {...bodyProps} />
              : variant == 3 ? <MonoCard {...bodyProps} />
                : <OutlineCard {...bodyProps} />
      }
    </TouchableOpacity>
  )
})

const styles = createStyle({
  card: {
    overflow: 'hidden',
    borderRadius: 20,
    justifyContent: 'flex-end',
    borderWidth: 1,
    borderColor: 'transparent',
    ...shadow,
  },
  blob: {
    position: 'absolute',
    opacity: 0.38,
  },
  scrim2: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  scrim: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
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
  bigNum: {
    position: 'absolute',
    right: 6,
    fontWeight: '900',
    includeFontPadding: false,
  },
  indexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 4,
  },
  indexBar: {
    width: 10,
    height: 2,
    borderRadius: 1,
    marginRight: 4,
  },
  indexText: {
    fontWeight: '700',
    letterSpacing: 1,
  },
  lightBar: {
    position: 'absolute',
    left: 0,
  },
  lightBarGlow: {
    position: 'absolute',
    left: 0,
    opacity: 0.25,
  },
  lightIndex: {
    position: 'absolute',
    top: 10,
    right: 12,
    fontWeight: '700',
  },
  lightFooter: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    padding: 12,
  },
  lightArrow: {
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collageTile: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
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
  monoTint: {
    position: 'absolute',
    opacity: 0.22,
  },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    opacity: 0.9,
  },
  monoIndex: {
    position: 'absolute',
    top: 12,
    left: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  monoFooter: {
    padding: 12,
  },
  monoName: {
    fontWeight: '900',
    lineHeight: 21,
  },
  monoUnderline: {
    height: 3,
    borderRadius: 2,
    marginTop: 6,
    opacity: 0.9,
  },
  outlineFill: {
    position: 'absolute',
    left: 1.5,
    top: 1.5,
    borderRadius: 19,
    overflow: 'hidden',
  },
  innerRing: {
    position: 'absolute',
    alignSelf: 'center',
    top: '16%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  innerRing2: {
    position: 'absolute',
    alignSelf: 'center',
    top: '24%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  outlineCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  outlineName: {
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 19,
  },
  outlineDot: {
    width: 14,
    height: 3,
    borderRadius: 2,
    marginTop: 7,
  },
})

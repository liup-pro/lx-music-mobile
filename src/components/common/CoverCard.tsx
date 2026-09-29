import { memo } from 'react'
import { Platform, TouchableOpacity, View } from 'react-native'
import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from './Text'
import Image from './Image'
import { Icon } from './Icon'
import BoardTile from './BoardTile'

/** 播放量格式化：20.2万 / 1.3亿，已带单位的原样返回 */
export const formatPlayCount = (count?: string | number | null): string => {
  if (count == null || count === '') return ''
  const str = String(count)
  if (/[万亿]/.test(str)) return str
  const num = parseInt(str.replace(/\D/g, ''))
  if (!Number.isFinite(num) || num <= 0) return ''
  if (num >= 1e8) return (num / 1e8).toFixed(1) + '亿'
  if (num >= 1e4) return (num / 1e4).toFixed(1) + '万'
  return String(num)
}

export interface CoverCardProps {
  img?: string
  title: string
  subtitle?: string
  playCount?: string | number | null
  width: number
  radius?: number
  onPress?: () => void
  nativeID?: string
}

export default memo(({ img, title, subtitle, playCount, width, radius = 16, onPress, nativeID }: CoverCardProps) => {
  const theme = useTheme()
  const count = formatPlayCount(playCount)
  return (
    <TouchableOpacity activeOpacity={.8} onPress={onPress} style={{ width }}>
      <View style={{ ...styles.cover, width, height: width, borderRadius: radius }}>
        {
          img
            ? <Image url={img} nativeID={nativeID} style={{ width, height: width, borderRadius: radius }} />
            : <BoardTile id={title} name={title} size={width} radius={radius} centered labelSize={Math.round(width * .18)} />
        }
        {
          count ? (
            <View style={styles.badge}>
              <Icon name="play-outline" size={9} color="#fff" />
              <Text size={10} color="#fff" style={styles.badgeText}>{count}</Text>
            </View>
          ) : null
        }
      </View>
      <Text size={14} color={theme['c-font']} numberOfLines={2} style={styles.title}>{title}</Text>
      {
        subtitle ? <Text size={12} color={theme['c-font-label']} numberOfLines={1} style={styles.subtitle}>{subtitle}</Text> : null
      }
    </TouchableOpacity>
  )
})

const styles = createStyle({
  cover: {
    overflow: 'hidden',
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: 7,
    right: 7,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.42)',
    borderRadius: 7,
    paddingLeft: 5,
    paddingRight: 6,
    paddingVertical: 3,
  },
  badgeText: {
    marginLeft: 3,
    fontWeight: '600',
  },
  title: {
    fontWeight: '700',
    lineHeight: 19,
  },
  subtitle: {
    marginTop: 2,
  },
})

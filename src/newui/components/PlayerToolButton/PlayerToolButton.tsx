import { memo } from 'react'
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native'

import { PLAYER, useTheme } from '@/newui/theme'

import { Icon, type IconName } from '../Icon'

export interface PlayerToolButtonProps {
  /** 图标名；开启态由容器换成另一枚轮廓（timer/timerOn、float/floatOn，循环五态五轮廓） */
  name: IconName
  /** 无障碍标签：工具行只剩图形，状态文案一律走 aria-label（原型 index.html L346 注释） */
  accessibilityLabel: string
  onPress?: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * 播放页次级工具行按钮（对应原型 .pt-btn，styles.css L649-653）：
 * 一行四颗等分（flex:1）的纯图标钮，无选中底色、无文字标签——
 * 开关状态只由图标本身表达（容器按状态换 name），这里只做按压缩放。
 * 纯展示组件：图标与文案由容器传入，不读任何状态。
 */
export const PlayerToolButton = memo(
  ({ name, accessibilityLabel, onPress, style }: PlayerToolButtonProps) => {
    const theme = useTheme()
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [
          styles.root,
          pressed && { transform: [{ scale: PLAYER.ptPressScale }] },
          style,
        ]}
      >
        <Icon name={name} size={PLAYER.ptIcon} color={theme.colors.text2} />
      </Pressable>
    )
  },
)

PlayerToolButton.displayName = 'NewUIPlayerToolButton'

const styles = StyleSheet.create({
  /** .pt-btn flex:1 / min-width:0 / padding 9px 2px（原型 place-items:center，RN 用居中） */
  root: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: PLAYER.ptPaddingY,
    paddingHorizontal: PLAYER.ptPaddingX,
  },
})

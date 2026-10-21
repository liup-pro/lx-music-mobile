import { memo } from 'react'
import { Animated, Pressable, StyleSheet } from 'react-native'

import { ChartArt } from '../ChartArt'

import { usePressFx } from '@/newui/hooks/usePressFx'
import { ART_INK, RADIUS, RANK_CARD, type ChartArtKind } from '@/newui/theme'
import { withAlpha } from '@/newui/utils'

/** 按压反馈要动 `Pressable` 本体：套一层 `Animated.View` 会改掉 flex 布局，见 usePressFx 头注 */
const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

export interface RankCardProps {
  /** 单卡边长（.rk-card aspect-ratio:1，两列网格由容器算出宽度传入） */
  width: number
  /** 榜名（.rk-name，交给 ChartArt：既上封面色也做文字层） */
  name: string
  /** 副行（.rk-sub，平台全称；原型卡上只留榜名 + 平台两行真数据） */
  sub: string
  /** 榜型 → 封面符号（六型；色按榜名查表，不由外部传入） */
  kind: ChartArtKind
  onPress?: () => void
}

/**
 * 榜单卡（原型 app.js rankCard L640-661 / .rk-card，styles.css L385-397，排行榜页 #rankGrid 直接子项）：
 * 正方卡 = ChartArt（平色深底 + 单色线条符号 + 两行文字）+ 1px 白色高光内描边 + 按压缩放 .96。
 * 旧版的平台 tint 对角渐变 / 纹理 / 双层 veil 已按第 7a 轮原型退役；
 * 封面色由 ChartArt 走 const/rank.ts 的 rankChartTint 按榜名查表（同名榜跨平台同色）。
 * 纯展示组件；「点进去看完整排名」由容器接线。
 */
export const RankCard = memo(({ width, name, sub, kind, onPress }: RankCardProps) => {
  // `.rk-card:active{transform:scale(.96)}`（styles.css L512），过渡 `.2s` 即 MOTION.fast
  const pressFx = usePressFx({ scale: RANK_CARD.pressScale })
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={pressFx.onPressIn}
      onPressOut={pressFx.onPressOut}
      style={[
        styles.root,
        {
          width,
          height: width,
          // .rk-card inset 0 0 0 1px rgba(255,255,255,.16)（原型的外投影 0 18px 34px -24px
          // 带负 spread，RN shadow 表达不了，维持只用内描边表达层次）
          borderColor: withAlpha(ART_INK.fg, RANK_CARD.ringAlpha),
        },
        pressFx.animatedStyle,
      ]}
    >
      <ChartArt height={width} kind={kind} name={name} sub={sub} width={width} />
    </AnimatedPressable>
  )
})

RankCard.displayName = 'NewUIRankCard'

const styles = StyleSheet.create({
  root: {
    flexShrink: 0,
    borderRadius: RADIUS.m,
    borderWidth: 1,
    overflow: 'hidden',
  },
})

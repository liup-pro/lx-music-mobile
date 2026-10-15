import { memo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import type { TabDefinition } from '@/newui/const'
import {
  FONT_SIZE,
  FONT_WEIGHT,
  GLASS,
  GRADIENTS,
  LETTER_SPACING,
  RADIUS,
  SHADOW,
  TAB_BAR,
  useTheme,
} from '@/newui/theme'

import { Icon } from '../Icon'
import { BlurredContainer } from '../Glass'

export interface TabBarProps {
  /** Tab 定义（key / 文案 / 图标），来自 @/newui/const 的 NEW_UI_TABS */
  items: readonly TabDefinition[]
  /** 当前选中的 key（原型 .tab.is-active） */
  activeKey: string
  onSelect: (key: string) => void
  /** 底部安全区高度（原型 calc(var(--safe-b) + 60px)） */
  bottomInset?: number
}

interface TabProps {
  item: TabDefinition
  active: boolean
  onSelect: (key: string) => void
}

/** 单个 Tab（原型 .tab：23px 图标 + 10.5px 文案 + 选中态顶部渐变指示条） */
const Tab = memo(({ item, active, onSelect }: TabProps) => {
  const theme = useTheme()
  const color = active ? theme.colors.text : theme.colors.text3
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={() => onSelect(item.key)}
      style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
    >
      {active && (
        <LinearGradient
          colors={[...GRADIENTS.brand.colors]}
          start={GRADIENTS.brand.start}
          end={GRADIENTS.brand.end}
          style={styles.indicator}
        />
      )}
      <Icon name={item.icon} size={TAB_BAR.iconSize} color={color} />
      <Text style={[styles.label, { color }]}>{item.label}</Text>
    </Pressable>
  )
})

Tab.displayName = 'NewUITabBarItem'

/**
 * 底部导航栏（对应原型 .tabbar / .tab）。
 * 手机竖屏形态；Pad 侧栏形态（.phone.pad .tabbar）留待响应式轮次，按窗口宽度切换容器。
 *
 * 底色（2026-10-13 bug-fix「首页」第 1 条）：原型 .tabbar 是
 * `linear-gradient(to top, rgba(8,8,12,.96), rgba(8,8,12,.62))` + backdrop-filter
 * `blur(26px) saturate(180%)`（styles.css L479-486）——本机已引入 @react-native-community/blur，
 * 底铺改为共通件 `BlurredContainer`（真模糊 + 同参数染色渐变），玻璃规格取 theme.GLASS.tabBar。
 * 结构保持 2026-10-12「内容穿透」修复的分层口径：
 * 1. 玻璃层永远 `pointerEvents="none"`，只有 Tab 本体吃点击；
 * 2. 原生模块缺失/位点禁用时玻璃层自动退回不透明 `theme.colors.bg` 铺底（即上一批已验收形态）；
 * 3. 顶部 1px 高光对应原型 `box-shadow: inset 0 1px 0 var(--hairline)`（styles.css L556；
 *    深 .06 白 / 浅 .06 黑，随主题反相）。
 *    2026-10-15 撤掉盒外上沿 16px「渐隐收边条」：原型 .tabbar 只有盒内 to-top 渐变
 *    （rgba 62%→96%）+ 盒内 blur(26) + 1px 高光，盒外没有任何铺底/收边带
 *    （与顶栏 2026-10-21 QA 撤下沿收边条同一口径）——这条带让栏上方内容被额外压暗
 *    且带底 .85 与盒顶 .62 之间有可见亮度跳变，是「还是有些许差别」的主因之一。
 */
export const TabBar = memo(({ items, activeKey, onSelect, bottomInset = 0 }: TabBarProps) => {
  const theme = useTheme()
  return (
    <View
      style={[
        styles.root,
        { height: TAB_BAR.height + bottomInset, paddingBottom: bottomInset },
      ]}
    >
      {/* 玻璃底：真模糊（blur 26）+ 原型同档染色渐变；不可用时退回不透明 bg 铺底。
          原型 .tabbar 盒外无任何收边带（2026-10-15 撤盒外上沿 16px 渐隐，见头注释第 3 条） */}
      <BlurredContainer spec={GLASS.tabBar} />
      {/* 原型 .tabbar box-shadow:inset 0 1px 0 var(--hairline)（styles.css L556） */}
      <View pointerEvents="none" style={[styles.hairline, { backgroundColor: theme.colors.hairline }]} />
      {items.map((item) => (
        <Tab key={item.key} item={item} active={item.key === activeKey} onSelect={onSelect} />
      ))}
    </View>
  )
})

TabBar.displayName = 'NewUITabBar'

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: TAB_BAR.paddingTop,
  },
  /** .tabbar inset 0 1px 0 var(--hairline)：顶部 1px 高光（取 colors.hairline，浅色自动反相） */
  hairline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: TAB_BAR.gap,
  },
  /** .tab.is-active::before：22×3 渐变条，top -8px（落在 padding-top 区内） */
  indicator: {
    position: 'absolute',
    top: TAB_BAR.indicatorTop,
    width: TAB_BAR.indicatorWidth,
    height: TAB_BAR.indicatorHeight,
    borderRadius: RADIUS.dot,
    ...SHADOW.glow,
  },
  label: {
    fontSize: FONT_SIZE.tiny,
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: LETTER_SPACING.wide,
  },
  /** .tab:active 缩放反馈 */
  pressed: {
    transform: [{ scale: 0.92 }],
  },
})

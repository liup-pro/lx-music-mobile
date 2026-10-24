import { memo, useMemo } from 'react'
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import Svg, { Circle } from 'react-native-svg'

import { GLASS, MINIBAR, RADIUS, useTheme } from '@/newui/theme'

import { Art } from '../Art'
import { BlurredContainer } from '../Glass'
import { Icon } from '../Icon'
import { EqBars } from '../SongRow/EqBars'

export interface MinibarSnappedProps {
  /** 封面种子（'album:' + 专辑名，同完整条口径） */
  artSeed: string
  /** 封面图地址 */
  artUri?: string
  /** 是否在播：正中状态标换成三柱跳动 / 一枚静三角 */
  playing: boolean
  /** 播放进度 0..1（外圈那一弧） */
  ratio: number
  /** 圆点直径：竖屏 56 / 横屏 52（原型 --mini-dot，宽屏档收一档） */
  size: number
  /** 点一下 = 展开回完整条（原型 miniBarClick 里 snapped 那一支：不直接进播放页） */
  onPress: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * 磁吸圆点（原型 `.minibar.is-snapped`，styles.css L728-795）。
 *
 * 一枚半透明圆点贴在屏边，里面三层：
 *  1. 封面——半径撑满到「直径 − 8」（原型 .mini-art 在 snapped 态就是 dot − 8，4px 内衬），
 *     底色压到 `--mini-art-alpha`（深 .70 / 浅 .76）：底下的字还看得见、封面仍认得出，
 *     两种都拍过照的口径，别加厚；
 *  2. 外圈那一弧进度——原型是 conic-gradient 加 radial 挖空，RN 用 SVG 描边环等价：
 *     整环 `miniRing` 打底 + 品牌色弧按进度走，起点在 12 点方向（原型 conic 的 0deg 就是正上方，
 *     SVG 圆默认从 3 点起，故整环旋转 −90°）；
 *  3. 正中那枚 22 状态标——播放中三柱（复用行内 .eq 那套动画）、暂停一枚静三角；
 *     整只圆点就是一个「展开」钮，它自己不接点击（原型 mini-dock-mark 的 aria-hidden）。
 *
 * 玻璃底走共通件 `BlurredContainer`，规格 GLASS.miniSnapped = 原型 `--mini-veil` 薄纱 + 3px 模糊。
 * 3px 是上限：圆点压在推入层内容上，糊得越狠底下的字越像没有（原型注释里的实测结论）。
 * 原生模糊不可用时降级为不透明 surface2 小圆（宁可厚一点也不漏内容）。
 * 纯展示件：进度与播放态由挂点（MinibarHost）喂进来，自己不订阅 store、不持动画。
 */
export const MinibarSnapped = memo(
  ({
    artSeed,
    artUri,
    playing,
    ratio,
    size,
    onPress,
    style,
  }: MinibarSnappedProps) => {
    const theme = useTheme()
    // 封面直径 = 直径 − 8（原型 calc(var(--mini-dot) - 8px)）：4px 内衬留给外圈那一弧
    const artSize = size - MINIBAR.snappedArtInset * 2
    const artAlpha = MINIBAR.snappedArtAlpha[theme.scheme]
    // 环画在外缘内侧半像素处，避免被圆角裁掉一半笔触（原型那条 mask 也是贴边 2px 环带）
    const ringRadius = (size - MINIBAR.snappedRingWidth) / 2 - 0.5
    const circumference = 2 * Math.PI * ringRadius
    const dashOffset = useMemo(
      () => circumference * (1 - Math.max(0, Math.min(1, ratio))),
      [circumference, ratio],
    )
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="播放条 · 贴在屏幕边缘的圆点，点一下展开"
        onPress={onPress}
        style={[
          styles.root,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderColor: theme.colors.miniDotLine,
          },
          // 原型 snap 态投影 0 4px 14px -8px rgba(0,0,0,.6)：负 spread 表达不了，取一半半径 + 低透明度近似
          {
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.28,
            shadowRadius: 7,
            elevation: 8,
          },
          style,
        ]}
      >
        <BlurredContainer spec={GLASS.miniSnapped} />
        <View
          pointerEvents="none"
          style={[
            styles.art,
            { width: artSize, height: artSize, borderRadius: artSize / 2, opacity: artAlpha },
          ]}
        >
          <Art
            width={artSize}
            height={artSize}
            radius={artSize / 2}
            seed={artSeed}
            imageUri={artUri}
          />
        </View>
        {/* 外圈那一弧：整环 miniRing 打底 + 品牌色按进度盖上去（0 时只剩打底环） */}
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Svg width={size} height={size}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={ringRadius}
              stroke={theme.colors.miniRing}
              strokeWidth={MINIBAR.snappedRingWidth}
              fill="none"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={ringRadius}
              stroke={theme.colors.brand}
              strokeWidth={MINIBAR.snappedRingWidth}
              fill="none"
              strokeDasharray={[circumference, circumference]}
              strokeDashoffset={dashOffset}
              // 进度从正上方起、顺时针一圈（原型 conic-gradient 不写 from 的起点），
              // 而 SVG 的圆从 3 点方向起画，所以整环绕圆心回退 90°
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
        </View>
        {/* 正中状态标：22 的毛玻璃小圆（深底白墨 / 浅底深墨）。原型那 6px 模糊换成半透明底——
            圆点本身已经是一层 BlurView，里面再嵌一层 Android 上就是两次整屏采样，不值当 */}
        <View
          pointerEvents="none"
          style={[
            styles.mark,
            {
              backgroundColor: theme.colors.miniMarkBg,
              borderColor: theme.colors.miniMarkLine,
            },
          ]}
        >
          {playing
            ? (
              <EqBars color={theme.colors.miniMarkInk} height={MINIBAR.snappedEqHeight} />
              )
            : (
              <Icon
                name="play"
                size={MINIBAR.snappedMarkIcon}
                color={theme.colors.miniMarkInk}
                style={styles.markIcon}
              />
              )}
        </View>
      </Pressable>
    )
  },
)

MinibarSnapped.displayName = 'NewUIMinibarSnapped'

const styles = StyleSheet.create({
  /** .minibar.is-snapped：正圆 + 1px 发丝描边（borderWidth 1 即原型 inset 0 0 0 1px 的等价） */
  root: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** .is-snapped .mini-main{padding:4px} 的等价：封面居中，四周各留 4 */
  art: {
    overflow: 'hidden',
  },
  /** .mini-dock-mark：22 全圆、1px 内描边、居中压在封面上 */
  mark: {
    position: 'absolute',
    width: MINIBAR.snappedMarkSize,
    height: MINIBAR.snappedMarkSize,
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** 暂停那一枚静三角的视觉居中补偿（原型 .mini-dock-mark .ic margin-left:1px） */
  markIcon: {
    marginLeft: 1,
  },
})

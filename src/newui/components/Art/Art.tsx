import { memo, useEffect, useState, type ReactNode } from 'react'
import { Image, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import { NEW_UI_IMG_HTTP_HEADERS } from '@/newui/const'
import { ART_INK, GRADIENTS, RADIUS, useTheme } from '@/newui/theme'
import { withAlpha } from '@/newui/utils'

import { Icon, type IconName } from '../Icon'

import { ArtTexture, pickArtPalette } from './artTexture'

/** 无图占位的品牌默认渐变（对应 .art 的 --c1/--c2 缺省值） */
const DEFAULT_PALETTE: readonly [string, string] = [GRADIENTS.art.colors[0], GRADIENTS.art.colors[1]]

export interface ArtProps {
  width: number
  height: number
  /** 圆角，默认 --r-s（12） */
  radius?: number
  /** 程序化封面种子（如 'album:' + 专辑名）：由种子推导渐变与纹理，优先于 palette */
  seed?: string
  /** 无图时的对角渐变首尾色（--c1/--c2），默认品牌粉紫；有 seed 时被覆盖 */
  palette?: readonly [string, string]
  /** 封面图 URI；给定时渲染图片（.art-img），否则为渐变底 */
  imageUri?: string
  /** 无图时的居中占位图标（.ic-center） */
  icon?: IconName
  /** 占位图标边长；不传时按原型的 46%（.art .ic-center .ic）取短边比例 */
  iconSize?: number
  /** 图片底部压暗遮罩（.art-scrim，仅随图渲染），图上叠文字时开启 */
  scrim?: boolean
  /** 覆盖层内容（角标 / 徽标 / 播放态等） */
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

/**
 * 封面原语（对应原型 .art）：渐变底 + 程序化纹理 + 可选图片 + 可选底部压暗 + 可选居中图标。
 * 全站封面（歌单卡 / 歌曲行 / 播放页）一律走它，保证视觉一致。
 */
export const Art = memo(
  ({
    width,
    height,
    radius = RADIUS.s,
    seed,
    palette = DEFAULT_PALETTE,
    imageUri,
    icon,
    iconSize,
    scrim = false,
    children,
    style,
  }: ArtProps) => {
    const theme = useTheme()
    const hasImage = imageUri != null && imageUri.length > 0
    // 2026-10-15 歌单封面走查：网络图加载失败（CDN 防热链 403、断网、坏链）时按「无图」口径
    // 回落种子占位（对齐旧 UI common/Image 的 onError→EmptyPic 与换 url 复位逻辑），
    // 而不是留一块「有图坑位却没图」的素渐变。失败不自动重试：一次挂载一次请求，不轰炸。
    const [loadFailed, setLoadFailed] = useState(false)
    useEffect(() => {
      setLoadFailed(false)
    }, [imageUri])
    const showImage = hasImage && !loadFailed
    // 有 seed：色板与纹理全部由种子决定（palette 仅供无 seed 的纯色场景）
    const triple = seed != null && seed.length > 0 ? pickArtPalette(seed) : null
    const c1 = triple ? triple[0] : palette[0]
    const c2 = triple ? triple[1] : palette[1]
    // 2026-10-15 性能轮：纹理层只在「无图」时挂。
    // 原型 CSS 里 .art 的 background（渐变 + svgArt 纹理）本就是**占位底**，
    // .art img 是 absolute inset:0 + object-fit:cover 铺满整个盒子 —— 有真图时纹理一个像素都看不见。
    // RN 侧此前无论有没有图都挂 ArtTexture（一个 react-native-svg 原生视图，点阵变体 25 个 Circle），
    // 而全站封面（歌曲行 / 卡片）绝大多数是有图的：每张卡都白付一个 SVG 视图的挂载 + 绘制成本，
    // 一屏十几行 / 一个列表几十行累计起来就是滚动与切页的帧预算大头。
    // 渐变底仍保留（图片解码完成前它是占位底，图挂了也靠它兜底），只撤掉自绘纹理。
    return (
      <View style={[{ width, height, borderRadius: radius, overflow: 'hidden' }, style]}>
        <LinearGradient
          colors={[c1, c2]}
          start={GRADIENTS.art.start}
          end={GRADIENTS.art.end}
          style={StyleSheet.absoluteFill}
        />
        {!showImage && triple != null && seed != null && <ArtTexture seed={seed} palette={triple} />}
        {showImage && (
          <Image
            source={{ uri: imageUri, headers: NEW_UI_IMG_HTTP_HEADERS }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => setLoadFailed(true)}
          />
        )}
        {scrim && showImage && (
          <LinearGradient
            // 渐隐终点写「同一基色（veil 黑）的零透明」而非 CSS 'transparent'：
            // Android LinearGradient 把 'transparent' 当 rgba(0,0,0,0)，中间档已是黑基色半透明，
            // 插向纯黑会糊出黑块（同 LyricList 2026-10-11 真机踩坑结论）
            colors={[theme.colors.artScrim, withAlpha(ART_INK.veil, ART_INK.scrimMidAlpha), withAlpha(ART_INK.veil, 0)]}
            locations={[0, 0.46, 1]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        )}
        {!showImage && icon != null && (
          <View style={styles.center}>
            <Icon
              name={icon}
              size={iconSize ?? Math.round(Math.min(width, height) * 0.46)}
              color={ART_INK.fg}
            />
          </View>
        )}
        {children}
      </View>
    )
  },
)

Art.displayName = 'NewUIArt'

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

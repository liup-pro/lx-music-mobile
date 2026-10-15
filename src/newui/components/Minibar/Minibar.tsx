import { memo } from 'react'
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'

import {
  FONT_SIZE,
  FONT_WEIGHT,
  GLASS,
  GRADIENTS,
  MINIBAR,
  SHADOW,
  useTheme,
} from '@/newui/theme'

import { Art } from '../Art'
import { Icon } from '../Icon'
import { BlurredContainer } from '../Glass'
import { QTag } from '../QTag'
import { SrcBadge } from '../SongRow'

export interface MinibarProps {
  /** 封面种子（'album:' + 专辑名，同播放页口径） */
  artSeed: string
  /** 封面图地址（无图时 Art 画程序化底） */
  artUri?: string
  /** 曲名（.mini-title） */
  title: string
  /** 歌手（.mini-sub 尾段，可截尾） */
  artist: string
  /** 平台简称（.src-badge label；本地曲目无平台色，缺省用三级文字色） */
  sourceLabel: string
  /** 平台 tint（.src-badge --tint） */
  sourceTint?: string
  /** 音质标签（.q-tag，副行第二段）；空串（本地曲目）则角标与其后置分隔条整段不渲染 */
  qualityLabel: string
  /** 是否在播（决定 play/pause 图标） */
  playing: boolean
  /** 已收藏（心钮亮主色） */
  loved: boolean
  /** 播放进度 0..1（顶部 2px 细进度） */
  ratio: number
  /** 点整条 = 展开播放页（原型 minibar click → player） */
  onPress: () => void
  onTogglePlay: () => void
  onToggleFav: () => void
  /** 下一曲（2026-10-13 bug-fix「首页」第 2 条：原型 minibar 本无此钮，按用户口径新增于播停右侧） */
  onPlayNext: () => void
  style?: StyleProp<ViewStyle>
}

/**
 * 迷你播放条（对应原型 .minibar，styles.css L453-477）：
 * 顶部 2px 渐变进度 + 封面 / 曲名 / 「平台·音质·歌手」+ 收藏、播停圆钮与下一曲钮
 * （副行四段顺序对齐原型 .mini-sub：平台角标 → 音质角标 QTag → 分隔条 → 歌手，
 * 音质为空串的本地曲目时角标与分隔条整段省略；下一曲为 2026-10-13 bug-fix「首页」第 2 条按用户口径新增，原型无此钮）。
 * 底色（2026-10-13 bug-fix「首页」第 1 条，对齐原型毛玻璃；原型 .minibar 底为
 * var(--glass)（= colors.glassPatch，深 rgba(10,10,16,.74) / 浅 rgba(255,255,255,.82)）
 * + backdrop-filter blur(28px) saturate(180%)）——底色层走共通件 `BlurredContainer`
 * （玻璃规格 theme.GLASS.minibar：真模糊 + glassPatch 染色；2c 轮 tint 基色已切到 glassPatch，
 * 两条渲染路径共用同一染色层，天然同源），两条历史口径同时满足：
 * 1. **与内容分层不糊成一片**（2026-10-12 修复）：模糊像 + 半透明染色天然与锐利滚过的内容分层；
 *    真模糊不可用（原生模块缺失/位点 enabled=false）时玻璃层自动退回**不透明 surface2 底层**
 *    （垫在 glassPatch 染色层之下保底不透明）；
 * 2. 底层 pointerEvents="none"，点击仍归整条 Pressable 与其上的圆钮；
 * 3. 浮在滚动内容之上的层叠数由容器（MinibarDock）经 Z_LAYER.minibar 显式声明，
 *    组件本体保持纯展示、不关心自己排在第几层。
 * 纯展示组件：进度每秒由容器（MinibarDock）传入，此处不订阅 store。
 */
export const Minibar = memo(
  ({
    artSeed,
    artUri,
    title,
    artist,
    sourceLabel,
    sourceTint,
    qualityLabel,
    playing,
    loved,
    ratio,
    onPress,
    onTogglePlay,
    onToggleFav,
    onPlayNext,
    style,
  }: MinibarProps) => {
    const theme = useTheme()
    const fillWidth = `${Math.min(Math.max(ratio, 0), 1) * 100}%` as const
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={[styles.root, { borderColor: theme.colors.line }, SHADOW.float, style]}
      >
        {/* 玻璃底：真模糊（blur 28）+ glassPatch 贴片染色（原型 .minibar background:var(--glass)，
            GLASS.minibar tintBase='glassPatch'，深浅两套各按 token 自身 alpha）；
            不可用时退回不透明 surface2 底层，染色层两路径同源 */}
        <BlurredContainer spec={GLASS.minibar} />
        {/* .mini-progress：底为控件叠色 fill-2（原型 L529 background:var(--fill-2)，
            结构件叠色 fill-4 是 .seek 那条规则，与此不是同一档），填充为品牌渐变（每秒一步，宽度动画省略） */}
        <View pointerEvents="none" style={[styles.progressTrack, { backgroundColor: theme.colors.fill2 }]}>
          <LinearGradient
            colors={[...GRADIENTS.brand.colors]}
            start={GRADIENTS.brand.start}
            end={GRADIENTS.brand.end}
            style={[styles.progressFill, { width: fillWidth }]}
          />
        </View>

        <View style={styles.main}>
          <View style={styles.artWrap}>
            <Art
              width={MINIBAR.artSize}
              height={MINIBAR.artSize}
              radius={MINIBAR.artRadius}
              seed={artSeed}
              imageUri={artUri}
            />
          </View>
          <View style={styles.meta}>
            <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
              {title}
            </Text>
            <View style={styles.subRow}>
              {/* 副行顺序对齐原型（app.js L1700 / styles.css L533 .mini-sub）：
                  平台角标 → 音质角标（真 QTag 组件，非纯文本）→ 分隔条 → 歌手；
                  本地曲目 qualityLabel 为空串时 QTag 与其后置分隔条整段不渲染，
                  避免孤零零一根 sep（同 SongRow 轮 4 四段口径） */}
              <SrcBadge label={sourceLabel} tint={sourceTint ?? theme.colors.text3} />
              {qualityLabel ? <QTag label={qualityLabel} /> : null}
              {artist.length > 0 && (
                <>
                  {qualityLabel ? (
                    <View style={[styles.sep, { backgroundColor: theme.colors.lineStrong }]} />
                  ) : null}
                  <Text numberOfLines={1} style={[styles.subText, { color: theme.colors.text3 }]}>
                    {artist}
                  </Text>
                </>
              )}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="喜欢"
            onPress={onToggleFav}
            style={({ pressed }) => [
              styles.act,
              pressed && { transform: [{ scale: MINIBAR.pressScale }] },
            ]}
          >
            <Icon
              name={loved ? 'heartFill' : 'heart'}
              size={MINIBAR.actIcon}
              color={loved ? theme.colors.brand : theme.colors.text2}
            />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="播放/暂停"
            onPress={onTogglePlay}
            style={({ pressed }) => [
              styles.act,
              styles.actPrimary,
              SHADOW.miniPrimary,
              pressed && { transform: [{ scale: MINIBAR.pressScale }] },
            ]}
          >
            <LinearGradient
              colors={[...GRADIENTS.brand.colors]}
              start={GRADIENTS.brand.start}
              end={GRADIENTS.brand.end}
              style={StyleSheet.absoluteFill}
            />
            <Icon
              name={playing ? 'pause' : 'play'}
              size={MINIBAR.primaryIcon}
              color={theme.colors.onBrand}
            />
          </Pressable>
          {/* 下一曲（2026-10-13 bug-fix「首页」第 2 条）：原型 .minibar 只有收藏 + 播停两枚，
              按用户口径在播停右侧新增一枚；视觉节奏与收藏钮同款（.mini-act 34 圆底 / 19 图标 / text-2），
              不缩封面不截曲名。无队列/单曲时行为由 core/player.playNext 自身兜底，不做假 disabled */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="下一曲"
            onPress={onPlayNext}
            style={({ pressed }) => [
              styles.act,
              pressed && { transform: [{ scale: MINIBAR.pressScale }] },
            ]}
          >
            <Icon name="next" size={MINIBAR.actIcon} color={theme.colors.text2} />
          </Pressable>
        </View>
      </Pressable>
    )
  },
)

Minibar.displayName = 'NewUIMinibar'

const styles = StyleSheet.create({
  root: {
    height: MINIBAR.height,
    borderRadius: MINIBAR.radius,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: MINIBAR.progressHeight,
  },
  progressFill: {
    height: '100%',
  },
  /** .mini-main padding 0 12 / gap 11 */
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: MINIBAR.gap,
    paddingHorizontal: MINIBAR.paddingX,
  },
  artWrap: {
    width: MINIBAR.artSize,
    height: MINIBAR.artSize,
    borderRadius: MINIBAR.artRadius,
    overflow: 'hidden',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  /** .mini-title 13.5 / 700 */
  title: {
    fontSize: FONT_SIZE.bodyLg,
    fontWeight: FONT_WEIGHT.bold,
  },
  /** .mini-sub 11 / text-3 / gap 6 / margin-top 2 */
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: MINIBAR.subGap,
    marginTop: MINIBAR.subMarginTop,
  },
  subText: {
    flexShrink: 1,
    fontSize: FONT_SIZE.caption,
  },
  /** .sep 1×9 */
  sep: {
    width: MINIBAR.sepWidth,
    height: MINIBAR.sepHeight,
    flexShrink: 0,
  },
  /** .mini-act 34 全圆 */
  act: {
    width: MINIBAR.actSize,
    height: MINIBAR.actSize,
    borderRadius: MINIBAR.actSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
  },
  actPrimary: {
    // 渐变底由内层 LinearGradient 承担
    backgroundColor: 'transparent',
  },
})

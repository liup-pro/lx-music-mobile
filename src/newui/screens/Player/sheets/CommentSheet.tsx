import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { filterList, getHotComment, type Comment } from '@/screens/Comment/utils'

import { QTag, Sheet } from '@/newui/components'
import { NEW_UI_SHEET_COMMENT } from '@/newui/const'
import { COMMENT, FONT_SIZE, FONT_WEIGHT, SHEET, useTheme } from '@/newui/theme'
import { formatCount } from '@/newui/utils'

import { CommentNode } from './CommentNode'

/** 每页条数，逐条照抄旧 CommentHot.tsx L5 的 limit = 15 */
const COMMENT_LIMIT = 15

type Phase = 'loading' | 'ready' | 'error'
/** 分页尾部状态（对齐旧 List.tsx 的 status：idle/loading/end/error） */
type MoreState = 'idle' | 'loading' | 'end' | 'error'

export interface CommentSheetProps {
  visible: boolean
  /** 当前播放的在线歌曲；由容器保证非本地时才有值 */
  musicInfo: LX.Music.MusicInfoOnline | null
  onClose: () => void
  bottomInset?: number
}

/**
 * 评论浮层（对应原型 renderCommentSheet app.js L1239 + .cmt-* styles.css L632-646）：
 * 复用旧评论数据层 getHotComment（src/screens/Comment/utils.ts L38），
 * **分页口径逐条照抄旧 CommentHot.tsx**：page 从 1 起、每页 15 条、
 * CommentInfo { total, maxPage }（utils.ts L17-24）、isEnd = page >= maxPage（旧 L50）、
 * 首页 isEnd = maxPage === 1（旧 L62）、追加时 filterList 去重（utils.ts L50）。
 * 触底取下一页挂在 Sheet 骨架自带的唯一 ScrollView 上（onEndReached），不嵌第二层滚动容器。
 * 点赞是新 UI 里的本地状态（旧工程评论无点赞写接口，不造假接线）。
 * 评论项（含回复层级）渲染委托给同目录递归展示件 CommentNode，本容器只管数据与三态。
 */
export const CommentSheet = ({ visible, musicInfo, onClose, bottomInset }: CommentSheetProps) => {
  const theme = useTheme()

  const [phase, setPhase] = useState<Phase>('loading')
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [moreState, setMoreState] = useState<MoreState>('idle')
  // 本浮层会话内的点赞态（关闭即复位，不假装持久化）
  const [likedIds, setLikedIds] = useState<ReadonlySet<string>>(new Set())

  /**
   * 分页账本放 ref（同旧 CommentHot 的 listInfo ref）：异步回调读最新值，
   * 换歌/重开时由 effect 复位；gen 是自增令牌，旧请求晚归一律作废（不污染新歌的分页）。
   */
  const pagerRef = useRef({ gen: 0, page: 0, maxPage: 1, isEnd: false, isLoading: false })

  const queryKey = useMemo(
    () => (musicInfo == null ? '' : `${musicInfo.source}:${musicInfo.id}`),
    [musicInfo],
  )

  // 首屏（第 1 页）取数：visible 或 queryKey 变化时重来，分页账本整体复位
  useEffect(() => {
    if (!visible || musicInfo == null) return
    const pager = pagerRef.current
    const gen = ++pager.gen
    pager.page = 0
    pager.maxPage = 1
    pager.isEnd = false
    pager.isLoading = false
    setPhase('loading')
    setMoreState('idle')
    setLikedIds(new Set())
    void (async () => {
      try {
        const res = await getHotComment(musicInfo, 1, COMMENT_LIMIT)
        if (pager.gen !== gen) return
        setComments(filterList(res.comments))
        setTotal(res.total)
        pager.page = 1
        pager.maxPage = res.maxPage
        pager.isEnd = res.maxPage <= 1
        setPhase('ready')
        setMoreState(pager.isEnd ? 'end' : 'idle')
      } catch {
        if (pager.gen === gen) setPhase('error')
      }
    })()
    // queryKey 变化 = 换了歌，重取（musicInfo 对象引用每次渲染都可能变，故用 key）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, queryKey])

  /** 取下一页并追加（口径同旧 CommentHot.handleListLoadMore L44-54：loading/isEnd 挡重入，成功后页码 +1） */
  const handleLoadMore = useCallback(() => {
    if (musicInfo == null || phase !== 'ready') return
    const pager = pagerRef.current
    if (pager.isLoading || pager.isEnd) return
    const gen = pager.gen
    pager.isLoading = true
    setMoreState('loading')
    void getHotComment(musicInfo, pager.page + 1, COMMENT_LIMIT)
      .then((res) => {
        if (pager.gen !== gen) return
        pager.page += 1
        pager.isLoading = false
        pager.isEnd = pager.page >= pager.maxPage
        // 追加去重（同旧 L52 filterList([...旧, ...新])），不是替换
        setComments((prev) => filterList([...prev, ...res.comments]))
        setMoreState(pager.isEnd ? 'end' : 'idle')
      })
      .catch(() => {
        if (pager.gen !== gen) return
        pager.isLoading = false
        setMoreState('error')
      })
  }, [musicInfo, phase])

  // 点赞态上抛给展示件 CommentNode（useCallback 稳引用，让 memo 在分页追加时不空转）
  const toggleLiked = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return (
    <Sheet
      visible={visible}
      title={NEW_UI_SHEET_COMMENT.title}
      subtitle={NEW_UI_SHEET_COMMENT.sub}
      onClose={onClose}
      bottomInset={bottomInset}
      onEndReached={handleLoadMore}
    >
      {phase === 'loading' && (
        <Text style={[styles.state, { color: theme.colors.text3 }]}>
          {NEW_UI_SHEET_COMMENT.loading}
        </Text>
      )}
      {phase === 'error' && (
        <Text style={[styles.state, { color: theme.colors.text3 }]}>
          {NEW_UI_SHEET_COMMENT.error}
        </Text>
      )}
      {phase === 'ready' && comments.length === 0 && (
        <Text style={[styles.state, { color: theme.colors.text3 }]}>
          {NEW_UI_SHEET_COMMENT.empty}
        </Text>
      )}

      {phase === 'ready' && comments.length > 0 && (
        <>
          {/* .cmt-total：总数 + 排序说明（原型还有一枚「乐评人长评」标签，真实接口无此口径，不造假） */}
          <View style={styles.total}>
            <Text style={[styles.totalNum, { color: theme.colors.text }]}>
              {formatCount(total)}
            </Text>
            <QTag label={NEW_UI_SHEET_COMMENT.sortTag} />
          </View>

          {/* 评论项渲染整体委托给递归展示件 CommentNode（bug-fix「评论浮窗」第 2 条）：
              根级 = 完整块（头像/点赞/正文），回复级 = 缩进胶囊，层级按真实 reply 嵌套递归；
              无回复的普通评论外观与分页行为零变化 */}
          {comments.map((c, index) => (
            <CommentNode
              key={String(c.id)}
              comment={c}
              depth={0}
              first={index === 0}
              liked={likedIds.has(String(c.id))}
              onToggleLike={toggleLiked}
            />
          ))}

          {/* 分页状态行（旧 List.tsx L108-127 Footer 的等价物）：加载中 / 到底了 / 失败可点重试，如实标注 */}
          {moreState !== 'idle' && (
            <Pressable
              onPress={moreState === 'error' ? handleLoadMore : undefined}
              hitSlop={8}
              style={({ pressed }) => [styles.more, pressed ? styles.pressed : null]}
              accessibilityRole={moreState === 'error' ? 'button' : undefined}
            >
              <Text style={[styles.moreText, { color: theme.colors.text3 }]}>
                {moreState === 'loading' && NEW_UI_SHEET_COMMENT.moreLoading}
                {moreState === 'end' && NEW_UI_SHEET_COMMENT.moreEnd}
                {moreState === 'error' && NEW_UI_SHEET_COMMENT.moreError}
              </Text>
            </Pressable>
          )}
        </>
      )}
    </Sheet>
  )
}

CommentSheet.displayName = 'NewUICommentSheet'

const styles = StyleSheet.create({
  state: {
    marginTop: 24,
    fontSize: FONT_SIZE.smallLg,
    lineHeight: SHEET.subLineHeight,
  },
  /** .cmt-total gap:8 / margin-bottom:2，b 19px/900 tabular */
  total: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: COMMENT.totalGap,
    marginTop: 14,
    marginBottom: COMMENT.totalMarginBottom,
  },
  totalNum: {
    fontSize: FONT_SIZE.headingLg,
    fontWeight: FONT_WEIGHT.black,
    fontVariant: ['tabular-nums'],
  },
  pressed: {
    transform: [{ scale: 0.95 }],
  },
  /** 分页状态行：居中 + 旧 footer 的 10px 内衬 */
  more: {
    padding: COMMENT.morePadding,
    alignItems: 'center',
  },
  moreText: {
    fontSize: FONT_SIZE.small,
    textAlign: 'center',
  },
})

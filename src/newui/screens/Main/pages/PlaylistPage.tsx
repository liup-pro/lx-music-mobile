import { useCallback, useMemo } from 'react'
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native'

import type { ListInfoItem } from '@/store/songlist/state'

// 直连 entry 而非 '@/newui/navigation' 桶口：避免 navigation/index → register → screens → 本文件的循环引用
import { pushNewUiLocalListDetail, pushNewUiSonglistDetail } from '@/newui/navigation/entry'

import {
  CardGrid,
  ChipRow,
  EmptyTip,
  FootNote,
  HScroll,
  MyPlCard,
  PageHeader,
  PagingEnd,
  PagingStatus,
  PillButton,
  PlCard,
  Section,
} from '@/newui/components'
import {
  getPlatformMeta,
  NEW_UI_BOARD_LIST_ID_PREFIX,
  NEW_UI_PAGING_END_TEXT,
  NEW_UI_PLAYLIST_ART_SEED,
  NEW_UI_PLAYLIST_EMPTY,
  NEW_UI_PLAYLIST_FOOT_NOTE,
  NEW_UI_PLAYLIST_MANAGE,
  NEW_UI_PLAYLIST_STATUS,
  NEW_UI_PLAYLIST_TITLES,
  plPoolCountLabel,
} from '@/newui/const'
import {
  NEW_UI_PLAYLIST_ALL_TAG,
  selectPlaylistTag,
  useGridItemWidth,
  useMyPlaylistCovers,
  useMyPlaylists,
  usePageEndReached,
  usePlaylistCategories,
  usePlaylistChipItems,
  usePlaylistPool,
  usePlaylistTagSelection,
  type MyPlaylistItem,
} from '@/newui/hooks'
import { FONT_SIZE, PLATFORM_TINTS, useTheme, type PlatformTintKey } from '@/newui/theme'

import type { NewUiPageProps } from '../../types'

/**
 * 歌单页（原型 #page-playlist）容器：分类条 + 我的歌单横排 + 推荐歌单池（分批续取，轮 9）。
 * 数据全部走既有模块：分类/歌单池 = @/core/songlist（沿用用户上次看歌单的平台与排序），
 * 我的歌单 = @/store/list 的 allList + @/core/list 取数量；点卡进新 UI 歌单详情层（阶段 9c）。
 * 视觉交给共通组件（ChipRow / MyPlCard / PlCard / CardGrid / PagingStatus），此处只接数据与动作。
 * 池子分批（原型 app.js L657-679）：每屏落 10 份（PL_POOL_PAGING.pageSize），滚到底经
 * usePageEndReached 通知 hook 续取下一批（先吃本地已有、见底才一页一页往下取并累加）；
 * 尾巴状态行与排行榜同一件 PagingStatus、同一语义，只在真实追加请求在途/失败时露出（在途配 RunningDots 获取动画）；
 * 取完收口时列表尾换成共通终点行 PagingEnd「没有更多了」（原型 L766 plEndRow）；
 * 计数没取完时报「已列出 N / M 个」（M=平台真实总数，占位值剔除后如实降级，见 const/playlist.ts）。
 */
export const PlaylistPage = ({ componentId, onSwitchTab, onOpenPlIdSheet, onOpenPlTagsSheet, onCatLayoutY }: NewUiPageProps) => {
  const theme = useTheme()
  const cats = usePlaylistCategories()
  // 选中分类走共享模块（chip 行与「全部分类」浮层都可写）：切 Tab 页面重挂载后也从这里取回当前选择；
  // 切平台时该共享模块自行把选择复位回「全部」（各平台分类目录互不相通，见 hooks/playlistTagSelection）
  const selection = usePlaylistTagSelection()
  const pool = usePlaylistPool(cats.source, selection.key, cats.sortId)
  const myLists = useMyPlaylists()
  // 2026-10-15 收口：「我的歌单」横排接补图 hook（与「我的」页 PlCard 同一口径，见 useMyPlaylistCovers）——
  // 平台导入的歌单按 source+sourceListId 走 core/songlist 取真封面；纯自建 / 存榜条目本就无图，如实留种子占位
  const listCovers = useMyPlaylistCovers(myLists)
  const cardWidth = useGridItemWidth()

  // chip 行 = 「全部」+ 平台热门 + 行尾「全部分类」入口（trailing，另行接线）；
  // 装配逻辑已抽共通 hook（QA D-06：原位与主屏吸顶层两处同一口径，见 hooks/playlistChipItems）
  const chipItems = usePlaylistChipItems(cats.items, selection)

  const handleTagSelect = useCallback((key: string) => {
    const hit = chipItems.find(item => item.key === key)
    if (hit) selectPlaylistTag({ key: hit.key, label: hit.label })
  }, [chipItems])

  // 触底续取：距底判定在主屏 PageViewport（160px 触发线，与排行榜同一条链路），
  // 这里只接「该取下一批了」的信号；重取在途时由 hook 内部拦住，这里不重复判
  usePageEndReached(pool.loadNextBatch)

  // 原型 #plPoolTitle：全部 → 「推荐歌单」；选中分类 → 「{分类} · 歌单」
  const poolTitle = useMemo(() => {
    if (selection.key === NEW_UI_PLAYLIST_ALL_TAG) return NEW_UI_PLAYLIST_TITLES.pool
    return `${selection.label} · 歌单`
  }, [selection])

  // 原型 .pl-count（paintPlPool L757）：没取完时说清「已列出 N / M 个」，M 用平台真实总数（取不到如实降级，
  // 见 plPoolCountLabel / hook 的占位总数剔除）；加载与首批失败时不显示，避免和提示文案打架
  const countText = pool.loading || pool.error
    ? ''
    : plPoolCountLabel(pool.shownCount, pool.totalCount)

  // 原型 paintPlPool L762：shown < pool.length && (loading || failed) 才挂状态行——
  // 本地推进窗口是同步的，正常续取时这一行不会被看见，只有真实追加请求在途/失败才露出；
  // 正在获取标识（2026-10-15 换动画）：disabled（在途）那句配 RunningDots 三点接力跳动，retry 句裸文字可点
  const showStatus = pool.hasMore && (pool.batchLoading || pool.batchFailed)
  // 原型 L766 else-if 分支：池子取完且窗口全露出（shown >= pool.length）时列表尾收上「没有更多了」
  // —— 与状态行互斥，收尾后滚到底不再对着空白猜「还有没有」
  const showEnd = !pool.hasMore && !pool.loading && pool.items.length > 0

  const handleMyPlPress = useCallback((list: MyPlaylistItem) => {
    // 从平台导入过的歌单 → 新 UI 歌单详情层（阶段 9c 换线，按平台坐标打开，mine 形态面包屑）。
    // 「存整榜」那份坐标带 board__ 前缀：剥前缀 + rank 形态打开（与我的页同款判定，见 const/songlistDetail）
    if (list.source && list.sourceListId) {
      const isBoard = list.sourceListId.startsWith(NEW_UI_BOARD_LIST_ID_PREFIX)
      pushNewUiSonglistDetail(componentId, {
        id: isBoard
          ? list.sourceListId.slice(NEW_UI_BOARD_LIST_ID_PREFIX.length)
          : list.sourceListId,
        source: list.source,
        name: list.name,
        author: '',
      }, isBoard ? 'rank' : 'mine', 'playlist')
      return
    }
    // 纯自建 / 试听 / 收藏：没有平台坐标，用同一详情页的「本地歌单」形态打开（listId 定位，
    // 2026-10-12 修复：不再是弹一句提示切去「我的」的假动作）
    pushNewUiLocalListDetail(componentId, { id: list.id, name: list.name }, 'playlist')
  }, [componentId])

  const handlePoolPress = useCallback((info: ListInfoItem) => {
    pushNewUiSonglistDetail(componentId, info, 'pl', 'playlist')
  }, [componentId])

  return (
    <>
      {/* 原型 .page-head + #plOpenBtn（app.js L1597 开 #plIdSheet）：阶段 9f 浮层落地，死按钮换活 */}
      <PageHeader
        title={NEW_UI_PLAYLIST_TITLES.page}
        after={<PillButton icon="link" onPress={onOpenPlIdSheet} />}
      />

      {/* 原型 #catRow：分类 chips = 全部 + 当前平台热门（hotTag）+ 行尾「全部分类」入口；
          全量目录来自 getTags().tags，由末尾入口开 PlTagsSheet 浮层逐组选择。
          QA 2026-10-14 D-06：外层 View 把本条在滚动内容里的纵坐标上报主屏（onCatLayoutY），
          分类条越过顶栏下沿时主屏根层 CatStickerBar 接手显示（原型 .cat-row sticky 的等价物） */}
      {!cats.loading && !cats.error && cats.items.length > 1 && (
        <View onLayout={(e: LayoutChangeEvent) => { onCatLayoutY?.(e.nativeEvent.layout.y) }}>
          <ChipRow
            variant="cat"
            items={chipItems}
            activeKey={selection.key}
            onSelect={handleTagSelect}
            trailing={onOpenPlTagsSheet && {
              label: NEW_UI_PLAYLIST_TITLES.allTags,
              onPress: onOpenPlTagsSheet,
            }}
          />
        </View>
      )}

      <Section
        sub
        title={NEW_UI_PLAYLIST_TITLES.mine}
        more={NEW_UI_PLAYLIST_MANAGE}
        onMorePress={() => onSwitchTab('mine')}
      >
        {myLists.length
          ? (
            <HScroll>
              {myLists.map(list => (
                <MyPlCard
                  key={list.id}
                  name={list.name}
                  sub={
                    list.count == null
                      ? '还在数有几首'
                      : list.source
                        ? `${list.count} 首 · 来自${getPlatformMeta(list.source).short}`
                        : `${list.count} 首`
                  }
                  artSeed={`${NEW_UI_PLAYLIST_ART_SEED.mine}:${list.id}`}
                  artUri={listCovers[list.id]}
                  onPress={() => handleMyPlPress(list)}
                />
              ))}
            </HScroll>
          )
          : <EmptyTip text={NEW_UI_PLAYLIST_EMPTY.mine} />}
      </Section>

      <Section
        sub
        title={poolTitle}
        right={countText ? (
          <Text style={[styles.count, { color: theme.colors.text3 }]}>{countText}</Text>
        ) : undefined}
      >
        {pool.error
          ? <EmptyTip text={pool.error} />
          : pool.items.length
            ? (
              <CardGrid>
                {pool.items.map(item => (
                  <PlCard
                    key={`${item.source}-${item.id}`}
                    width={cardWidth}
                    title={item.name}
                    artSeed={`${NEW_UI_PLAYLIST_ART_SEED.pool}:${item.id}`}
                    artUri={item.img ?? undefined}
                    tint={PLATFORM_TINTS[item.source as PlatformTintKey]}
                    meta={[item.play_count, item.total ? `${item.total} 首` : null]
                      .filter(Boolean)
                      .join(' · ')}
                    onPress={() => handlePoolPress(item)}
                  />
                ))}
                {/* 原型 .pl-status 作为网格直接子项横跨整行（grid-column:1/-1，轮 7b 同款落法） */}
                {showStatus ? (
                  <PagingStatus
                    disabled={pool.batchLoading}
                    loading={pool.batchLoading}
                    text={pool.batchFailed ? NEW_UI_PLAYLIST_STATUS.retry : NEW_UI_PLAYLIST_STATUS.loading}
                    onPress={pool.loadMore}
                  />
                ) : null}
                {showEnd ? <PagingEnd inGrid text={NEW_UI_PAGING_END_TEXT} /> : null}
              </CardGrid>
            )
            : <EmptyTip text={pool.loading ? NEW_UI_PLAYLIST_EMPTY.loading : NEW_UI_PLAYLIST_EMPTY.pool} />}
      </Section>

      <FootNote text={NEW_UI_PLAYLIST_FOOT_NOTE} />
    </>
  )
}

const styles = StyleSheet.create({
  /** .pl-count：11px / text-3（styles.css L318） */
  count: {
    fontSize: FONT_SIZE.caption,
  },
})

PlaylistPage.displayName = 'NewUIPlaylistPage'

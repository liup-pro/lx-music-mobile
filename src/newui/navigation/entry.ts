import { Dimensions } from 'react-native'
import { Navigation } from 'react-native-navigation'

import type { ListInfoItem } from '@/store/songlist/state'
import type { NewUiSonglistDetailKind } from '@/newui/const/songlistDetail'
import type { NewUiTabKey } from '@/newui/const/tabs'
// 只取类型（babel 会整条抹掉，不产生运行时依赖）：屏 → entry 是运行时的调用方向，反向不能有值引用
import type { NewUiPodcastDetailPassShow } from '@/newui/screens/Radio/PodcastDetailScreen'
import type { NewUiEpisodePassProps } from '@/newui/screens/Radio/EpisodeScreen'

import { PL_LAYER, PLAYER, SEARCH, getCachedNewUiScheme, readPersistedNewUiScheme } from '@/newui/theme'

import {
  NEW_UI_EPISODE_SCREEN,
  NEW_UI_MAIN_SCREEN,
  NEW_UI_PODCAST_DETAIL_SCREEN,
  NEW_UI_PODCAST_SEARCH_SCREEN,
  NEW_UI_PLAYER_SCREEN,
  NEW_UI_RADIO_HOME_SCREEN,
  NEW_UI_SEARCH_SCREEN,
  NEW_UI_SONGLIST_DETAIL_SCREEN,
} from './screenNames'
import { newUiScreenOptions } from './options'

/**
 * 新 UI 入口。启用方式（唯一一处旧代码接线）：
 * 把 src/app.ts 中的 `void navigations.pushHomeScreen()` 换成 `void setNewUiRoot()`；
 * 回滚同样只需换回原调用，新 UI 文件全部保留、互不影响。
 *
 * QA 2026-10-14 D-10 修正（原策略是「深色打底 + 挂载后 mergeOptions 校正」）：深色打底会让浅色用户冷启动闪一帧黑底。现在 setRoot 前
 * await 读一次持久化模式（AsyncStorage 毫秒级，root 未设时原生启动屏还在，首帧即落在真实模式）；
 * 运行中的 push 转场则同步读 ThemeProvider 回写的内存快照，不再硬编深色。
 */
export const setNewUiRoot = async () => {
  const scheme = await readPersistedNewUiScheme()
  return Navigation.setRoot({
    root: {
      stack: {
        children: [
          {
            component: {
              name: NEW_UI_MAIN_SCREEN,
              options: newUiScreenOptions(scheme),
            },
          },
        ],
      },
    },
  })
}

/** 从旧界面跳到新界面（并存调试用：不动根页面也能验收新 UI） */
export const pushNewUiMain = (componentId: string) => {
  return Navigation.push(componentId, {
    component: {
      name: NEW_UI_MAIN_SCREEN,
      options: newUiScreenOptions(getCachedNewUiScheme()),
    },
  })
}

/**
 * 打开新 UI 播放页（对应原型 .player-layer 的 translateY 100% → 0 / .46s 上滑入场）。
 * RNN 侧用 elementTransitions 平移整层（nativeID 见 screens/Player 根 View），
 * 与旧 pushPlayDetailScreen 的头部/控制区动效同一套已验证机制（Android）。
 * 底色取运行中的主题快照（QA D-10：不再硬编深色打底，闪动两帧的根源在底色与真模式不符）。
 */
export const pushNewUiPlayer = (componentId: string) => {
  const { height } = Dimensions.get('window')
  return Navigation.push(componentId, {
    component: {
      name: NEW_UI_PLAYER_SCREEN,
      options: {
        ...newUiScreenOptions(getCachedNewUiScheme()),
        animations: {
          push: {
            elementTransitions: [
              {
                id: 'newui.player.content',
                translationY: {
                  from: height,
                  duration: PLAYER.enterDuration,
                },
              },
            ],
          },
          pop: {
            elementTransitions: [
              {
                id: 'newui.player.content',
                translationY: {
                  to: height,
                  duration: PLAYER.enterDuration,
                },
              },
            ],
          },
        },
      },
    },
  })
}

/**
 * 打开新 UI 搜索层（原型 .pl-layer 的 translateX 100% → 0 / .44s 右推入场，
 * 见 styles.css L394-402 与 SEARCH.enterDuration）。
 * RNN 侧用 elementTransitions 横向平移整层（nativeID 见 screens/Search 根 View）。
 * 与播放页同一套底色策略：运行中 push，同步读主题快照（QA D-10）。
 */
export const pushNewUiSearch = (componentId: string) => {
  const { width } = Dimensions.get('window')
  return Navigation.push(componentId, {
    component: {
      name: NEW_UI_SEARCH_SCREEN,
      options: {
        ...newUiScreenOptions(getCachedNewUiScheme()),
        animations: {
          push: {
            elementTransitions: [
              {
                id: 'newui.search.content',
                translationX: {
                  from: width,
                  duration: SEARCH.enterDuration,
                },
              },
            ],
          },
          pop: {
            elementTransitions: [
              {
                id: 'newui.search.content',
                translationX: {
                  to: width,
                  duration: SEARCH.enterDuration,
                },
              },
            ],
          },
        },
      },
    },
  })
}

/**
 * 右推层（原型 `.pl-layer`）的共用体：`translateX 100% → 0`，时长 `PL_LAYER.enterDuration` 440ms。
 * RNN 侧用 elementTransitions 平移整层，`contentId` 即目标屏根 View 的 nativeID。
 * **转场只在这一处持有**：屏内一律调下面的 helper，不各自写 Navigation.push。
 * passProps 必须全部可序列化（RNN 走原生桥），store 对象 / 函数不许进来。
 */
const pushPlLayer = (
  componentId: string,
  name: string,
  contentId: string,
  passProps?: Record<string, unknown>,
) => {
  const { width } = Dimensions.get('window')
  return Navigation.push(componentId, {
    component: {
      name,
      ...(passProps != null ? { passProps } : {}),
      options: {
        ...newUiScreenOptions(getCachedNewUiScheme()),
        animations: {
          push: {
            elementTransitions: [
              {
                id: contentId,
                translationX: {
                  from: width,
                  duration: PL_LAYER.enterDuration,
                },
              },
            ],
          },
          pop: {
            elementTransitions: [
              {
                id: contentId,
                translationX: {
                  to: width,
                  duration: PL_LAYER.enterDuration,
                },
              },
            ],
          },
        },
      },
    },
  })
}

/**
 * 打开新 UI 歌单详情层（阶段 9c，平台歌单 / 榜单形态）。
 * info 即旧 pushSonglistDetailScreen 的 ListInfoItem（id / source / name / img / desc /
 * play_count / author），数据取歌只读复用 @/core/songlist；kind 决定面包屑与页脚文案。
 * fromTab（QA D-16）：来源主屏 Tab，详情页返回时落回它；非 Tab 页入口不传。
 */
export const pushNewUiSonglistDetail = (
  componentId: string,
  info: ListInfoItem,
  kind: NewUiSonglistDetailKind = 'pl',
  fromTab?: NewUiTabKey,
) => {
  return pushPlLayer(componentId, NEW_UI_SONGLIST_DETAIL_SCREEN, 'newui.songlistDetail.content',
    fromTab != null ? { info, kind, fromTab } : { info, kind })
}

/**
 * 打开新 UI 歌单详情层的「本地歌单」形态（2026-10-12 修复：自建歌单点进去不再是假动作）。
 * 同一个详情页、同一套布局，只是取数换成按本地 listId 读 @/core/list 的 getListMusics；
 * passProps 只带 id 与名字两个字符串（本地歌单没有平台封面，头部如实回落种子纹理）。
 * fromTab（QA D-16）同 pushNewUiSonglistDetail。
 * kind（QA D04 补）：缺省仍是 'local'；内置「我喜欢」这一张传 'fav'——取数链路完全相同
 * （都是按本地 listId 读 @/core/list），只有面包屑 / 页脚 / 空态三处文案换成原型 PLD_* 的 fav 一档。
 */
export const pushNewUiLocalListDetail = (
  componentId: string,
  list: { id: string; name: string },
  fromTab?: NewUiTabKey,
  kind: NewUiSonglistDetailKind = 'local',
) => {
  return pushPlLayer(componentId, NEW_UI_SONGLIST_DETAIL_SCREEN, 'newui.songlistDetail.content',
    fromTab != null
      ? { kind, listId: list.id, listName: list.name, fromTab }
      : { kind, listId: list.id, listName: list.name })
}

/**
 * 打开电台首页（U81，原型 #radioLayer；首页快捷四格那一颗的落点）。
 * 不带 passProps：地区、榜单与本机的订阅/进度都由屏自己从 `@/newui/podcast` 取。
 */
export const pushNewUiRadioHome = (componentId: string) => {
  return pushPlLayer(componentId, NEW_UI_RADIO_HOME_SCREEN, 'newui.radio.content')
}

/**
 * 打开播客详情层（U82，原型 #podcastLayer）。
 * show 是 U81 榜行 / U83 命中行带来的五项快照（契约 7.3④）：只带 id / name / by / tags / 封面，
 * `feedUrl` 与名次这一屏用不上、也不必要过原生桥；详情由本屏自己发 ③ 取。
 */
export const pushNewUiPodcastDetail = (componentId: string, show: NewUiPodcastDetailPassShow) => {
  return pushPlLayer(componentId, NEW_UI_PODCAST_DETAIL_SCREEN, 'newui.podcast.content', { show })
}

/** 打开搜节目层（U83，原型 #podcastSearchLayer）；历史词与结果都在屏内经数据层自取 */
export const pushNewUiPodcastSearch = (componentId: string) => {
  return pushPlLayer(componentId, NEW_UI_PODCAST_SEARCH_SCREEN, 'newui.podSearch.content')
}

/**
 * 打开单集屏（U84，原型 #episodeLayer）。
 * passProps 摊平进屏 props（屏那套 `NewUiEpisodePassProps` 就是单集视图模型，全字符串/数字；
 * ③ 给的音频直链 `episodeUrl` 要在那一屏真出声，所以得过原生桥）。
 */
export const pushNewUiEpisode = (componentId: string, passProps: NewUiEpisodePassProps) => {
  return pushPlLayer(componentId, NEW_UI_EPISODE_SCREEN, 'newui.episode.content', { ...passProps })
}

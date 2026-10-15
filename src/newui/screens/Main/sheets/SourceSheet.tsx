import { useCallback, useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import { setApiSource } from '@/core/apiSource'
import { updateSetting } from '@/core/common'
import { pause } from '@/core/player/player'
import { handleImportScript } from '@/screens/Home/Views/Setting/settings/Basic/UserApiEditModal/action'
import playerState from '@/store/player/state'
import { useSettingValue } from '@/store/setting/hook'
import { useStatus, useUserApiList } from '@/store/userApi'
import { httpFetch } from '@/utils/request'
import { assertApiSupport } from '@/utils/tools'

import { ChipFlow, GroupLabel, OpInputRow, OptionRow, Sheet } from '@/newui/components'
import {
  NEW_UI_SHEET_SOURCE,
  NEW_UI_SOURCE_INIT_TIMEOUT_MS,
  PLAY_QUALITY_CHOICES,
  PLATFORM_META,
  PLATFORM_SOURCE_KEYS,
  QUALITY_ORDER,
  formatApiVersion,
  formatQualityList,
} from '@/newui/const'
import { useApiSourceName, useApiSourceTick, useContentPlatform } from '@/newui/hooks'
import {
  FONT_SIZE,
  FONT_WEIGHT,
  OP_BOX,
  OPTION_ROW,
  useTheme,
} from '@/newui/theme'
import { getQualityFallback, isQualitySupported, setContentPlatformSource, showNewUiToast, withTimeout } from '@/newui/utils'

export interface SourceSheetProps {
  visible: boolean
  onClose: () => void
  /** 底部安全区（透传给 Sheet） */
  bottomInset?: number
}

/** 当前生效音源覆盖的平台 → 档位表（global.lx.qualityList，utils/tools.ts L141 同源的读法） */
const readCovered = (): Partial<Record<LX.OnlineSource, LX.Quality[]>> => {
  const list = global.lx.qualityList ?? {}
  const covered: Partial<Record<LX.OnlineSource, LX.Quality[]>> = {}
  for (const key of PLATFORM_SOURCE_KEYS) {
    const qualitys = (list as Record<string, LX.Quality[] | undefined>)[key]
    if (qualitys?.length) covered[key] = qualitys
  }
  return covered
}

/**
 * 音源设置浮层（原型 #sourceSheet，index.html L389-407；交互 renderSheet，app.js L2172-2259）。
 * 接线全部走旧 App 自己的路径，零重写：
 * - 当前生效音源 = 设置键 common.apiSource；列表 = useUserApiList（本项目内置表为空，条目全是用户导入脚本）
 * - 切换 = setApiSource（core/apiSource.ts L10-43，内部处理 setUserApi / destroyUserApi / updateSetting / apiSourceUpdated）
 * - 平台覆盖与音质档位 = global.lx.qualityList（启动由 core/init/userApi L177 写入、core/music/utils L221
 *   播放取档读的也是它 —— sheet 只列「真能播的档」，不列平台有但音源没接的档）
 * - 导入 = 链接抓取后 handleImportScript（语义照抄旧 ScriptImportOnline L82-106：必须 http(s) URL、
 *   抓回脚本正文再导入，不是让用户粘正文；本地文件导入留在旧设置页，原型 sheet 内本就没有该控件）
 * - 「音乐平台」组 = 内容平台选择器（原型 app.js L2206-2228 点行切全局 activeSource 的真实等价物）：
 *   点行经 utils/contentPlatform 写 saveSongListSetting + saveLeaderboardSetting 并脉冲，
 *   首页推荐歌单 / 首页热门单曲 / 歌单页分类与池子跟随重取（页面内不回显平台，用户 2026-10-12 拍板）。
 *   可选性只取决于平台目录接口（内置 SDK 直连平台公开页，与音源脚本无关，见 contentPlatform 头注释）；
 *   「当前音源没接上这个平台」只作行内如实提示（dim + 不可播角标），不等于不可选。
 * - 切源时「当前音质档不在新音源档位表里」不替用户改值：原型 app.js L2189-2191 同口径（注释原文
 *   「切源不把音质、内容平台重置：音质由核心按新档表自动降」，旧稿的「立即回落表首」已被原型自己撤掉）；
 *   真实项目未加载的脚本拿不到档位表（存储 info 无 sources，utils/data.ts addUserApi L554-572 只解析
 *   脚本头注释），同样不做造假式同步回落 —— 兜底交给播放核心：取地址时 getPlayQuality（core/music/utils L218-230）
 *   本就会沿 高→低 逐档自动降（曲目该档有 + 音源声明支持才算够得着，全落空则落 128k），
 *   所以「选了音源没有的高音质档 → 播不出声」在核心层面本就不会发生。UI 只负责把这条既有口径讲清，
 *   且只做展示（2026-10-15 定稿 + 2026-07-30 审计轮 QA D51 补齐）：音质区列核心认可的整档表，
 *   音源没有的档降显为不可选但可点击说明，标签保持纯音质标识（不追加「按 X 播」），
 *   表里存在置灰档时按原型常驻一句 q-note 解释；已存选择被降时给一句注释；
 *   浮层不写不支持的档（写入口收口，降不降由核心定，UI 不另造兜底）。
 */
export const SourceSheet = ({ visible, onClose, bottomInset }: SourceSheetProps) => {
  const theme = useTheme()
  const apiSource = useSettingValue('common.apiSource')
  const playQuality = useSettingValue('player.playQuality')
  const userApiList = useUserApiList()
  // 生效中 user_api 的加载状态（store/userApi/hook useStatus；initing → true/false）
  const apiStatus = useStatus()
  const currentName = useApiSourceName()
  // 当前内容平台（首页/歌单跟随的那份设置；本浮层是它唯一的选择入口）
  const platform = useContentPlatform()
  // 订阅 apiSourceUpdated：启动加载完成 / 用户切源 → 覆盖表与档位整层重算
  const tick = useApiSourceTick()

  const covered = useMemo(() => readCovered(), [tick]) // eslint-disable-line react-hooks/exhaustive-deps

  // 当前音源真实支持的档位 = 覆盖平台档位并集，按 QUALITY_ORDER 从低到高（原型 sc.qualities 的真实等价物）
  const supportedQualities = useMemo(() => {
    const set = new Set<LX.Quality>()
    for (const key of PLATFORM_SOURCE_KEYS) {
      for (const q of covered[key] ?? []) set.add(q)
    }
    return QUALITY_ORDER.filter(q => set.has(q))
  }, [covered])
  const supportedQualitySet = useMemo(() => new Set(supportedQualities), [supportedQualities])

  /**
   * 切源反馈（原型 app.js L2194-2198，QA D49）：原型那句 toast 是「已切到「X」vY」+
   * 当前这首在新音源下够不着时追加的「 · 当前这首不可播，已暂停」，并按这句把播放暂停。
   * 真实侧的新音源能力表要等脚本初始化完才写进 global.lx.qualityList
   * （core/init/userApi/index.ts L177，写完才 resolve apiInitPromise），按下这一刻读不到——不猜。
   * 于是借 core 自己维护的那颗 apiInitPromise 等到能力表落定的那一刻，把这句一次发完：
   * 判据仍走既有 utils/tools 的 assertApiSupport（本地曲恒判可播，不会被误停）；
   * 等不到（超时 / 初始化失败 → 整张能力表为空）时只报主句，不给「不可播」的假结论、也不暂停。
   */
  const announceSwitch = useCallback(async (name: string, version: string) => {
    let msg = NEW_UI_SHEET_SOURCE.switched(name, version)
    try {
      await withTimeout(global.lx.apiInitPromise[0], NEW_UI_SOURCE_INIT_TIMEOUT_MS)
    } catch {
      // 到限没 settle：读得到的覆盖表就是上一源的，判不了新源能力，按主句报完即止
      showNewUiToast(msg)
      return
    }
    const tables = readCovered()
    const playing = playerState.playMusicInfo.musicInfo
    // 播放条目可能是下载项（无 source 字段），取不到平台就不下结论
    const playingSource = playing != null && 'source' in playing ? playing.source : null
    if (Object.keys(tables).length > 0 && playingSource != null && !assertApiSupport(playingSource)) {
      void pause()
      msg += NEW_UI_SHEET_SOURCE.switchedUnplayable
    }
    showNewUiToast(msg)
  }, [])

  const handlePickScript = useCallback((item: LX.UserApi.UserApiInfo) => {
    if (item.id === apiSource) return
    setApiSource(item.id)
    void announceSwitch(item.name, item.version)
  }, [announceSwitch, apiSource])

  const handlePickPlatform = useCallback((key: LX.OnlineSource) => {
    // 再点当前平台不重复写（contentPlatform store 内部同款守卫，这里挡在 toast 之前）
    if (key === platform.source) return
    const label = PLATFORM_META[key].label
    setContentPlatformSource(key)
    // 目录与音源无关（见头注释）：未覆盖平台照样能选，只在 toast 里补一句如实提醒
    showNewUiToast(covered[key] != null
      ? NEW_UI_SHEET_SOURCE.platformSwitched(label)
      : NEW_UI_SHEET_SOURCE.platformSwitched(label) + NEW_UI_SHEET_SOURCE.platformSwitchedUncovered)
  }, [covered, platform.source])

  // 音质写入口收口（2026-10-13 兜底条）：只把「当前音源声明有的档」写进设置；
  // 点不支持的档不写、给一句人话说明 —— 真实降档由播放核心 getPlayQuality 完成，
  // 这里只是不把必然被降的选择存成「看起来生效」的状态（口径见 utils/quality 头注释）
  const handlePickQuality = useCallback((key: string) => {
    const q = key as LX.Quality
    if (isQualitySupported(supportedQualities, q)) {
      updateSetting({ 'player.playQuality': q })
      return
    }
    showNewUiToast(NEW_UI_SHEET_SOURCE.qualityPickUnsupported(
      currentName, q, getQualityFallback(q, supportedQualities),
    ))
  }, [currentName, supportedQualities])

  // 整档表（高→低）：支持的档正常可选；不支持的档降显不可选，但标签仍是纯音质标识
  // （「标准 128k」式），点它会给一句说明（不留「点了没反应又没说清」的死按钮）
  const qualityChips = useMemo(() => PLAY_QUALITY_CHOICES.map(q => {
    const ok = supportedQualitySet.has(q)
    return {
      key: q,
      label: NEW_UI_SHEET_SOURCE.qualityChip(q),
      active: ok && q === playQuality,
      disabled: !ok,
    }
  }), [playQuality, supportedQualitySet])

  // 已存的选择落在不支持档（切音源后的常见残留）：如实说明播放时降到哪
  const savedQualityDowngraded = supportedQualities.length > 0 && !supportedQualitySet.has(playQuality)

  // 整档表里只要有一档当前音源没有（= 出现置灰档），就常驻一句解释
  // （原型 app.js L2247 q-note，条件与渲染句同原型，QA D51）
  const hasDimQuality = supportedQualities.length > 0 &&
    PLAY_QUALITY_CHOICES.some(q => !supportedQualitySet.has(q))

  /* ---- 导入行（.op-box，index.html L402-405 同款控件；抓取语义同旧 ScriptImportOnline；
     输入行本体已抽为共通组件 OpInputRow，NameSheet 同款复用） ---- */
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importErr, setImportErr] = useState('')

  const handleImportPress = useCallback(async () => {
    if (importing) return
    const url = importUrl.trim()
    if (!/^https?:\/\//.test(url)) {
      setImportErr(NEW_UI_SHEET_SOURCE.importErrNotUrl)
      return
    }
    setImportErr('')
    setImporting(true)
    try {
      const script = await httpFetch(url).promise.then(resp => resp.body) as string
      // 体积上限同旧 ScriptImportOnline L99-102（9MB，防抓到整页 HTML）
      if (script.length > 9_000_000) {
        setImportErr(NEW_UI_SHEET_SOURCE.importErrTooLarge)
        return
      }
      // 成败 toast 由 handleImportScript 内部包办（action.ts L7-14）；列表经 list_changed 自动刷新
      await handleImportScript(script)
      setImportUrl('')
    } catch (err: any) {
      setImportErr(NEW_UI_SHEET_SOURCE.importErrFetch(err.message ?? String(err)))
    } finally {
      setImporting(false)
    }
  }, [importing, importUrl])

  return (
    <Sheet
      visible={visible}
      title={NEW_UI_SHEET_SOURCE.title}
      subtitle={NEW_UI_SHEET_SOURCE.sub}
      onClose={onClose}
      bottomInset={bottomInset}
    >
      {/* 「已安装音源」组（原型 #scriptList） */}
      <GroupLabel label={NEW_UI_SHEET_SOURCE.groupScripts} />
      {userApiList.length === 0 && (
        <Text style={[styles.note, { color: theme.colors.text3 }]}>
          {NEW_UI_SHEET_SOURCE.scriptsEmptyHint}
        </Text>
      )}
      <View style={styles.list}>
        {userApiList.map(item => {
          const isActive = item.id === apiSource
          // .or-state 三档：生效中的读真实加载状态；未生效的本项目脚本没有状态可查，
          // 原型同款语义即「未加载」（data.js SCRIPT_STATE.uninit），给中性「未启用」
          const stateLabel = isActive
            ? (apiStatus.status
              ? NEW_UI_SHEET_SOURCE.stateReady
              : apiStatus.message === 'initing'
                ? NEW_UI_SHEET_SOURCE.stateIniting
                : NEW_UI_SHEET_SOURCE.stateFailed)
            : NEW_UI_SHEET_SOURCE.stateIdle
          const stateTone = isActive
            ? (apiStatus.status ? theme.colors.ok : theme.colors.brand3)
            : theme.colors.text3
          // em：生效中的读运行时覆盖表「能播 N 个平台 · 音质列表」（原型 app.js L2183-2186）；
          // 一个平台都没接上时不写「能播 0 个平台」，回落到引导文案。
          // 未生效的存储信息不含能力清单，给脚本描述或如实引导，不编造平台数
          const coveredCount = PLATFORM_SOURCE_KEYS.filter(k => covered[k] != null).length
          const em = isActive
            ? coveredCount > 0
              ? [
                NEW_UI_SHEET_SOURCE.platformCount(coveredCount),
                formatQualityList(supportedQualities),
              ].filter(part => part.length > 0).join(' · ')
              : NEW_UI_SHEET_SOURCE.metaFallback
            : item.description.length > 0
              ? item.description
              : NEW_UI_SHEET_SOURCE.metaFallback
          return (
            <OptionRow
              key={item.id}
              name={item.name}
              version={item.version.length > 0 ? formatApiVersion(item.version) : undefined}
              sub={em}
              stateLabel={stateLabel}
              stateTone={stateTone}
              active={isActive}
              onPress={() => handlePickScript(item)}
            />
          )
        })}
      </View>

      {/* 「音乐平台」组（原型 #platformList）= 内容平台选择器：行行可选，
          选中项 = 首页推荐歌单 / 热门单曲 / 歌单页跟随的平台；
          dim / 不可播只说明「当前音源播不出这家的歌」，不妨碍选来看 */}
      <GroupLabel label={NEW_UI_SHEET_SOURCE.groupPlatforms} />
      <View style={styles.list}>
        {PLATFORM_SOURCE_KEYS.map(key => {
          const meta = PLATFORM_META[key]
          const ok = covered[key] != null
          const isCurrent = platform.ready && key === platform.source
          return (
            <OptionRow
              key={key}
              name={meta.label}
              sub={ok
                ? NEW_UI_SHEET_SOURCE.platformCovered
                : NEW_UI_SHEET_SOURCE.platformUncovered(currentName, meta.label)}
              stateLabel={isCurrent
                ? NEW_UI_SHEET_SOURCE.platformActiveTag
                : (ok ? undefined : NEW_UI_SHEET_SOURCE.unplayableTag)}
              stateTone={isCurrent ? theme.colors.ok : theme.colors.text3}
              active={isCurrent}
              dimmed={!ok && !isCurrent}
              onPress={() => handlePickPlatform(key)}
            />
          )
        })}
      </View>

      {/* 「音质」组（原型 #qualityRow）。原型只列支持档；真实音源档位参差，光看支持档说不清
          「选高音质会降到哪」——故列整档表（高→低）：不支持的档降显不可选、点击给说明；
          写入口只收支持档（2026-10-13 兜底条，口径见 utils/quality 与本文件头注释），
          标签保持纯音质标识（2026-10-15：不写「按 X 播」），有置灰档时常驻原型那句 q-note（QA D51） */}
      <GroupLabel label={NEW_UI_SHEET_SOURCE.groupQuality} />
      {supportedQualities.length > 0 ? (
        <>
          <ChipFlow items={qualityChips} onSelect={handlePickQuality} />
          {hasDimQuality && (
            <Text style={[styles.note, { color: theme.colors.text3 }]}>
              {NEW_UI_SHEET_SOURCE.qualityDimNote}
            </Text>
          )}
          {savedQualityDowngraded && (
            <Text style={[styles.note, { color: theme.colors.text3 }]}>
              {NEW_UI_SHEET_SOURCE.qualitySavedDowngradeNote(
                playQuality, getQualityFallback(playQuality, supportedQualities),
              )}
            </Text>
          )}
          {supportedQualities.length === 1 && (
            <Text style={[styles.note, { color: theme.colors.text3 }]}>
              {NEW_UI_SHEET_SOURCE.qualitySingleNote(currentName, supportedQualities[0])}
            </Text>
          )}
        </>
      ) : (
        <Text style={[styles.note, { color: theme.colors.text3 }]}>
          {NEW_UI_SHEET_SOURCE.qualityEmptyHint}
        </Text>
      )}

      {/* 「导入音源」组（原型 sheet 没有，但本项目内置音源表为空、不导入则只能单选，补真实入口；
          控件复用原型已有的 .op-box 贴链接行） */}
      <GroupLabel label={NEW_UI_SHEET_SOURCE.groupImport} />
      <OpInputRow
        value={importUrl}
        onChangeText={text => {
          setImportUrl(text)
          if (importErr.length > 0) setImportErr('')
        }}
        placeholder={NEW_UI_SHEET_SOURCE.importPlaceholder}
        goLabel={NEW_UI_SHEET_SOURCE.importGo}
        busyLabel={NEW_UI_SHEET_SOURCE.importGoBusy}
        busy={importing}
        keyboardType="url"
        onGo={() => { void handleImportPress() }}
      />
      {importErr.length > 0 && (
        <Text style={[styles.opErr, { color: theme.colors.dangerInk }]}>{importErr}</Text>
      )}
    </Sheet>
  )
}

SourceSheet.displayName = 'NewUISourceSheet'

const styles = StyleSheet.create({
  /** .opt-list：列向 gap 7 */
  list: {
    flexDirection: 'column',
    gap: OPTION_ROW.listGap,
  },
  /** .op-err：margin-top 10 / 11.5 / 行高 1.65（styles.css L773） */
  opErr: {
    marginTop: OP_BOX.errMarginTop,
    fontSize: FONT_SIZE.captionLg,
    lineHeight: OP_BOX.errLineHeight,
    fontWeight: FONT_WEIGHT.semibold,
  },
  /** .q-note：11 / text-3 / 行高 1.6（styles.css L761） */
  note: {
    marginTop: OP_BOX.errMarginTop,
    fontSize: FONT_SIZE.caption,
    lineHeight: 18,
  },
})

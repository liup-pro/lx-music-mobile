import { useCallback, useEffect, useState } from 'react'
import { StyleSheet, Text } from 'react-native'

import { ChipFlow, GroupLabel, OpInputRow, Sheet } from '@/newui/components'
import { NEW_UI_NICK_PICKS, NEW_UI_SHEET_NAME } from '@/newui/const'
import { nickNameInitial, sanitizeNick, useNickName } from '@/newui/hooks'
import { FONT_SIZE, OP_BOX, OPTION_ROW, useTheme } from '@/newui/theme'
import { showNewUiToast } from '@/newui/utils'

export interface NameSheetProps {
  visible: boolean
  onClose: () => void
  /** 底部安全区（透传给 Sheet） */
  bottomInset?: number
}

/**
 * 改昵称浮层（原型 #nameSheet，index.html L459-472；openNameSheet / saveNick，app.js L1174-1204）。
 * 阶段 7 备好的 useNickName.setNickName 在这里接上：保存后所有 useNickName 消费点
 * （我的页 .mh-art / 顶栏头像，原型 renderProfile 同步 #topAvatar 的行为，app.js L1168-1172）即时同源。
 * 清洗规则（trim + 内部空白压一个 + slice 12）在 useNickName 的 sanitizeNick 一处实现，
 * 与原型 saveNick L1189 一致；空值报错也是原型原句（L1192）。
 * 与原型口径的两点如实标注：
 * - .sc-hint 那句（index.html L472）逐字照抄——真实侧同样成立：昵称只落本机 AsyncStorage，
 *   不上传任何服务器，换设备读不到时回落缺省字（const/nameSheet.ts 注释）。
 * - chips（NICK_PICKS，app.js L1165）是纯 UI 文案非内容数据，保留；首枚即原型 BRAND（EchoIsle）。
 */
export const NameSheet = ({ visible, onClose, bottomInset }: NameSheetProps) => {
  const theme = useTheme()
  const { nickName, setNickName } = useNickName()
  const [draft, setDraft] = useState(nickName)
  const [err, setErr] = useState('')

  // 每次打开回填当前昵称、清掉上次报错（原型 openNameSheet app.js L1175-1176 打开即重置输入）
  useEffect(() => {
    if (visible) {
      setDraft(nickName)
      setErr('')
    }
  }, [visible, nickName])

  // 原型 saveNick（app.js L1188-1204）：清洗 → 空报错 → 与当前同名只关层 → 保存 + 关层 + toast
  const handleSave = useCallback((raw: string) => {
    const next = sanitizeNick(raw)
    if (!next) {
      setErr(NEW_UI_SHEET_NAME.errEmpty)
      return
    }
    if (next === nickName) {
      onClose()
      return
    }
    setNickName(next)
    setErr('')
    onClose()
    showNewUiToast(NEW_UI_SHEET_NAME.saved(next, nickNameInitial(next)))
  }, [nickName, onClose, setNickName])

  return (
    <Sheet
      visible={visible}
      title={NEW_UI_SHEET_NAME.title}
      subtitle={NEW_UI_SHEET_NAME.sub}
      onClose={onClose}
      bottomInset={bottomInset}
    >
      {/* 打开即聚焦输入框（原型 openNameSheet app.js L1175-1185：回填 + 清报错 + focus；Sheet 仅在可见时挂载内容，autoFocus 时机等价）。
          浮层滚动容器 keyboardShouldPersistTaps='handled' 由通用 Sheet 提供，不自造避让层。 */}
      <OpInputRow
        value={draft}
        onChangeText={text => {
          setDraft(text)
          if (err.length > 0) setErr('')
        }}
        placeholder={NEW_UI_SHEET_NAME.placeholder}
        goLabel={NEW_UI_SHEET_NAME.go}
        maxLength={12}
        autoFocus
        autoCapitalize="none"
        onGo={() => handleSave(draft)}
        onSubmitEditing={() => handleSave(draft)}
        style={styles.opRow}
      />
      {/* .op-err（index.html L469；样式同 styles.css L773，与 SourceSheet 错误行同规格） */}
      {err.length > 0 && (
        <Text style={[styles.opErr, { color: theme.colors.dangerInk }]}>{err}</Text>
      )}

      {/* 「换个快的」chips（index.html L470-471；原型 app.js L1179-1183 点 chip 即 saveNick(n)） */}
      <GroupLabel label={NEW_UI_SHEET_NAME.groupPicks} />
      <ChipFlow
        items={NEW_UI_NICK_PICKS.map(n => ({ key: n, label: n }))}
        onSelect={n => {
          setDraft(n)
          handleSave(n)
        }}
      />
      {/* .sc-hint（index.html L472，原型 sheet 底部灰字；口径见文件头注释） */}
      <Text style={[styles.hint, { color: theme.colors.text3 }]}>
        {NEW_UI_SHEET_NAME.hint}
      </Text>
    </Sheet>
  )
}

NameSheet.displayName = 'NewUINameSheet'

const styles = StyleSheet.create({
  /** .op-box 与副题的间距（原型组内容间距同 OP_BOX.marginTop 16） */
  opRow: {
    marginTop: OP_BOX.marginTop,
  },
  /** .op-err：margin-top 10 / 11.5 / 行高 1.65（styles.css L773） */
  opErr: {
    marginTop: OP_BOX.errMarginTop,
    fontSize: FONT_SIZE.captionLg,
    lineHeight: OP_BOX.errLineHeight,
  },
  /** .sc-hint：11 / text-3 / 行高 1.6（原型 sheet 底部说明，与 SourceSheet .q-note 同规格） */
  hint: {
    marginTop: OPTION_ROW.labelMarginBottom,
    fontSize: FONT_SIZE.caption,
    lineHeight: 18,
  },
})

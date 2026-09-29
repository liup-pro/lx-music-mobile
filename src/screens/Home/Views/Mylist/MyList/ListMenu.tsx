import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { ScrollView, TouchableOpacity, View } from 'react-native'

import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import Popup, { type PopupType } from '@/components/common/Popup'
import { LIST_IDS } from '@/config/constant'
import musicSdk from '@/utils/musicSdk'
import listState from '@/store/list/state'

export interface SelectInfo {
  listInfo: LX.List.MyListInfo
  index: number
}

// 兼容旧调用签名（底部面板不再需要锚点坐标，position 保留但忽略）
export interface Position { x?: number, y?: number, w?: number, h?: number }

interface MenuAction {
  action: string
  label: string
  disabled?: boolean
}

export interface ListMenuProps {
  onNew: (position: number) => void
  onRename: (listInfo: LX.List.UserListInfo) => void
  onSort: (listInfo: LX.List.MyListInfo) => void
  onDuplicateMusic: (listInfo: LX.List.MyListInfo) => void
  onImport: (listInfo: LX.List.MyListInfo, index: number) => void
  onExport: (listInfo: LX.List.MyListInfo, index: number) => void
  onSync: (listInfo: LX.List.UserListInfo) => void
  onSelectLocalFile: (listInfo: LX.List.MyListInfo, index: number) => void
  onRemove: (listInfo: LX.List.UserListInfo) => void
}
export interface ListMenuType {
  show: (selectInfo: SelectInfo, position?: Position) => void
}

const initSelectInfo: SelectInfo | null = null

/** 长按/点击歌单后的管理动作面板（底部弹出，取代原锚定悬浮菜单） */
export default forwardRef<ListMenuType, ListMenuProps>(({
  onNew,
  onRename,
  onSort,
  onDuplicateMusic,
  onImport,
  onExport,
  onSync,
  onSelectLocalFile,
  onRemove,
}, ref) => {
  const t = useI18n()
  const theme = useTheme()
  const popupRef = useRef<PopupType>(null)
  const selectInfoRef = useRef<SelectInfo | null>(initSelectInfo)
  const [title, setTitle] = useState('')
  const [menus, setMenus] = useState<MenuAction[]>([])

  useImperativeHandle(ref, () => ({
    show(selectInfo) {
      selectInfoRef.current = selectInfo
      setTitle(selectInfo.listInfo.name)
      setMenus(buildMenus(selectInfo.listInfo))
      popupRef.current?.setVisible(true)
    },
  }))

  const buildMenus = (listInfo: LX.List.MyListInfo): MenuAction[] => {
    let rename = false
    let sync = false
    let remove = false
    const local_file = !listState.fetchingListStatus[listInfo.id]
    switch (listInfo.id) {
      case LIST_IDS.DEFAULT:
      case LIST_IDS.LOVE:
        break
      default: {
        const userList = listInfo as LX.List.UserListInfo
        rename = true
        remove = true
        sync = !!(userList.source && musicSdk[userList.source]?.songList)
        break
      }
    }

    return [
      { action: 'new', label: t('list_create') },
      { action: 'rename', disabled: !rename, label: t('list_rename') },
      { action: 'sort', label: t('list_sort') },
      { action: 'duplicateMusic', label: t('lists__duplicate') },
      { action: 'local_file', disabled: !local_file, label: t('list_select_local_file') },
      { action: 'sync', disabled: !sync || !local_file, label: t('list_sync') },
      { action: 'import', label: t('list_import') },
      { action: 'export', label: t('list_export') },
      { action: 'remove', disabled: !remove, label: t('list_remove') },
    ]
  }

  const handlePress = (menu: MenuAction) => {
    if (menu.disabled) return
    popupRef.current?.setVisible(false)
    const selectInfo = selectInfoRef.current
    if (!selectInfo) return
    const { listInfo, index } = selectInfo
    switch (menu.action) {
      case 'new':
        onNew(Math.max(index - 1, 0))
        break
      case 'rename':
        onRename(listInfo as LX.List.UserListInfo)
        break
      case 'sort':
        onSort(listInfo)
        break
      case 'duplicateMusic':
        onDuplicateMusic(listInfo)
        break
      case 'import':
        onImport(listInfo, index)
        break
      case 'export':
        onExport(listInfo, index)
        break
      case 'sync':
        onSync(listInfo as LX.List.UserListInfo)
        break
      case 'local_file':
        onSelectLocalFile(listInfo, index)
        break
      case 'remove':
        onRemove(listInfo as LX.List.UserListInfo)
        break
      default:
        break
    }
  }

  return (
    <Popup ref={popupRef} title={title}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {
          menus.map(menu => (
            <TouchableOpacity
              key={menu.action}
              activeOpacity={0.7}
              disabled={menu.disabled}
              onPress={() => { handlePress(menu) }}
              style={{ ...styles.row, borderBottomColor: theme['c-border-background'] }}
            >
              <Text size={15} color={menu.disabled ? theme['c-font-label'] : theme['c-font']} style={{ opacity: menu.disabled ? 0.5 : 1 }}>
                {menu.label}
              </Text>
            </TouchableOpacity>
          ))
        }
        <View style={styles.bottomSpace} />
      </ScrollView>
    </Popup>
  )
})

const styles = createStyle({
  scroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  content: {
    paddingHorizontal: 12,
  },
  row: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  bottomSpace: {
    height: 12,
  },
})

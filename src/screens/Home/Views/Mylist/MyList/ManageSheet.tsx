import { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { FlatList, TouchableOpacity, View } from 'react-native'

import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import Input from '@/components/common/Input'
import { Icon } from '@/components/common/Icon'
import BoardTile from '@/components/common/BoardTile'
import Popup, { type PopupType } from '@/components/common/Popup'

export interface ManageSheetProps {
  allList: LX.List.MyListInfo[]
  activeListId: string
  onSelect: (id: string) => void
  onManage: (listInfo: LX.List.MyListInfo, index: number) => void
}
export interface ManageSheetType {
  setVisible: (visible: boolean) => void
}

const TILE_SIZE = 34
const ROW_H = 48
const MAX_VISIBLE_ROWS = 6

/** 全部歌单面板：顶部按名称搜索，行内切换 / 管理 */
export default forwardRef<ManageSheetType, ManageSheetProps>(({ allList, activeListId, onSelect, onManage }, ref) => {
  const t = useI18n()
  const theme = useTheme()
  const popupRef = useRef<PopupType>(null)
  const [keyword, setKeyword] = useState('')

  useImperativeHandle(ref, () => ({
    setVisible(visible) {
      if (!visible) setKeyword('')
      popupRef.current?.setVisible(visible)
    },
  }))

  const data = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return allList
      .map((list, index) => ({ list, index }))
      .filter(({ list }) => !kw || list.name.toLowerCase().includes(kw))
  }, [allList, keyword])

  const renderItem = ({ item }: { item: { list: LX.List.MyListInfo, index: number } }) => {
    const { list, index } = item
    const active = list.id == activeListId
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => { onSelect(list.id) }}
        style={{ ...styles.row, borderBottomColor: theme['c-border-background'] }}
      >
        <BoardTile id={list.id} name={list.name} size={TILE_SIZE} radius={7} centered labelSize={Math.round(TILE_SIZE * 0.24)} />
        <Text size={14} numberOfLines={1} color={active ? theme['c-primary-font-active'] : theme['c-font']} style={styles.rowName}>
          {list.name}
        </Text>
        {active ? <Icon name="checkbox-marked" size={15} color={theme['c-primary']} style={styles.rowIcon} /> : null}
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          onPress={() => { onManage(list, index) }}
          accessibilityLabel={t('mylist_manage_tip')}
          style={styles.manageBtn}
        >
          <Icon name="dots-vertical" size={17} color={theme['c-font-label']} />
        </TouchableOpacity>
      </TouchableOpacity>
    )
  }

  const keyExtractor = ({ list }: { list: LX.List.MyListInfo, index: number }) => list.id

  const listHeight = data.length === 0 ? 72 : Math.min(data.length, MAX_VISIBLE_ROWS) * ROW_H

  return (
    <Popup ref={popupRef} title={t('mylist_all_title')}>
      <View style={{ ...styles.searchWrap, backgroundColor: theme['c-button-background'] }}>
        <Icon name="search-2" size={14} color={theme['c-font-label']} style={styles.searchIcon} />
        <Input
          value={keyword}
          onChangeText={setKeyword}
          placeholder={t('mylist_search_placeholder')}
          size={13}
          clearBtn
          style={styles.searchInput}
        />
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        style={{ ...styles.list, height: listHeight }}
        keyboardShouldPersistTaps="always"
        ListEmptyComponent={<Text size={13} color={theme['c-font-label']} style={styles.empty}>{t('no_item')}</Text>}
      />
    </Popup>
  )
})

const styles = createStyle({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexGrow: 0,
    flexShrink: 0,
    height: 40,
    marginHorizontal: 12,
    marginTop: 2,
    marginBottom: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
  },
  list: {
    flexGrow: 0,
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },
  rowName: {
    flex: 1,
    marginLeft: 11,
    fontWeight: '500',
  },
  rowIcon: {
    marginRight: 4,
  },
  manageBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    textAlign: 'center',
    paddingTop: 20,
    paddingBottom: 20,
  },
})

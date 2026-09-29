import { useCallback, useRef } from 'react'
import { TouchableOpacity, View } from 'react-native'

import ListMenu, { type ListMenuType } from './ListMenu'
import ManageSheet, { type ManageSheetType } from './ManageSheet'
import ListNameEdit, { type ListNameEditType } from './ListNameEdit'
import ListMusicSort, { type ListMusicSortType } from './ListMusicSort'
import DuplicateMusic, { type DuplicateMusicType } from './DuplicateMusic'
import ListImportExport, { type ListImportExportType } from './ListImportExport'
import { handleRemove, handleSync } from './listAction'
import { useActiveListId, useMyList } from '@/store/list/hook'
import { setActiveList } from '@/core/list'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'

/** 纤细操作栏：全部歌单入口 + 新建入口（切换/查找/管理均收敛到底部面板） */
export default () => {
  const theme = useTheme()
  const t = useI18n()
  const allList = useMyList()
  const activeListId = useActiveListId()
  const listMenuRef = useRef<ListMenuType>(null)
  const manageSheetRef = useRef<ManageSheetType>(null)
  const listNameEditRef = useRef<ListNameEditType>(null)
  const listMusicSortRef = useRef<ListMusicSortType>(null)
  const duplicateMusicRef = useRef<DuplicateMusicType>(null)
  const listImportExportRef = useRef<ListImportExportType>(null)

  const handleSelect = useCallback((id: string) => {
    setActiveList(id)
  }, [])
  const handleManage = useCallback((listInfo: LX.List.MyListInfo, index: number) => {
    manageSheetRef.current?.setVisible(false)
    listMenuRef.current?.show({ listInfo, index })
  }, [])
  const handleCreate = useCallback(() => {
    listNameEditRef.current?.showCreate(allList.length - 1)
  }, [allList.length])

  return (
    <>
      <View style={styles.bar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => { manageSheetRef.current?.setVisible(true) }}
          accessibilityRole="button"
          style={styles.barLeft}
        >
          <Icon name="menu" size={17} color={theme['c-font']} />
          <Text size={14} color={theme['c-font']} style={styles.barTitle}>{t('mylist_all_title')}</Text>
          <Icon name="chevron-right" size={12} color={theme['c-font-label']} />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleCreate}
          accessibilityLabel={t('list_create')}
          style={styles.barBtn}
        >
          <Icon name="add-music" size={18} color={theme['c-primary-font']} />
        </TouchableOpacity>
      </View>
      <ManageSheet
        ref={manageSheetRef}
        allList={allList}
        activeListId={activeListId}
        onSelect={(id) => {
          handleSelect(id)
          manageSheetRef.current?.setVisible(false)
        }}
        onManage={handleManage}
      />
      <ListNameEdit ref={listNameEditRef} />
      <ListMusicSort ref={listMusicSortRef} />
      <DuplicateMusic ref={duplicateMusicRef} />
      <ListImportExport ref={listImportExportRef} />
      <ListMenu
        ref={listMenuRef}
        onNew={index => listNameEditRef.current?.showCreate(index)}
        onRename={info => listNameEditRef.current?.show(info)}
        onSort={info => listMusicSortRef.current?.show(info)}
        onDuplicateMusic={info => duplicateMusicRef.current?.show(info)}
        onImport={(info, position) => listImportExportRef.current?.import(info, position)}
        onExport={(info, position) => listImportExportRef.current?.export(info, position)}
        onRemove={info => { handleRemove(info) }}
        onSync={info => { handleSync(info) }}
        onSelectLocalFile={(info, position) => listImportExportRef.current?.selectFile(info, position)}
      />
    </>
  )
}

const styles = createStyle({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    paddingRight: 4,
  },
  barLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: '100%',
  },
  barTitle: {
    flex: 1,
    marginLeft: 7,
    fontWeight: '500',
  },
  barBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
})

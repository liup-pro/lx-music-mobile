import { useRef } from 'react'
import { TouchableOpacity } from 'react-native'

import ChipBar, { type ChipItem } from '@/components/common/ChipBar'
import ListMenu, { type ListMenuType, type Position } from './ListMenu'
import ListNameEdit, { type ListNameEditType } from './ListNameEdit'
import ListMusicSort, { type ListMusicSortType } from './ListMusicSort'
import DuplicateMusic, { type DuplicateMusicType } from './DuplicateMusic'
import ListImportExport, { type ListImportExportType } from './ListImportExport'
import { handleRemove, handleSync } from './listAction'
import { useActiveListId, useMyList } from '@/store/list/hook'
import { setActiveList } from '@/core/list'
import { useTheme } from '@/store/theme/hook'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'


export default () => {
  const theme = useTheme()
  const allList = useMyList()
  const activeListId = useActiveListId()
  const listMenuRef = useRef<ListMenuType>(null)
  const listNameEditRef = useRef<ListNameEditType>(null)
  const listMusicSortRef = useRef<ListMusicSortType>(null)
  const duplicateMusicRef = useRef<DuplicateMusicType>(null)
  const listImportExportRef = useRef<ListImportExportType>(null)

  const items = allList.map(list => ({ id: list.id, name: list.name }))

  const handleSelect = (id: string) => {
    setActiveList(id)
  }
  const handleLongPress = (item: ChipItem, index: number, position: Position) => {
    const listInfo = allList[index]
    if (!listInfo) return
    listMenuRef.current?.show({ listInfo, index }, position)
  }

  return (
    <>
      <ChipBar
        items={items}
        activeId={activeListId}
        onSelect={handleSelect}
        onLongPress={handleLongPress}
        trailing={
          <TouchableOpacity
            activeOpacity={.7}
            onPress={() => { listNameEditRef.current?.showCreate(allList.length - 1) }}
            style={{ ...styles.addChip, backgroundColor: theme['c-button-background'] }}
          >
            <Text size={18} color={theme['c-font']} style={styles.addText}>+</Text>
          </TouchableOpacity>
        }
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
  addChip: {
    borderRadius: 16,
    marginRight: 8,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    marginTop: -2,
    fontWeight: '600',
  },
})

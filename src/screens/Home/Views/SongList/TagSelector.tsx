import { useEffect, useMemo, useRef, useState } from 'react'
import { Modal, Pressable, ScrollView, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { StyleSheet } from 'react-native'

import ChipBar, { type ChipItem } from '@/components/common/ChipBar'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import TagGroup from './TagList/TagGroup'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { getTags } from '@/core/songlist'
import { type TagInfoItem, type TagInfoTypeItem } from '@/store/songlist/state'

export interface TagSelectorProps {
  source: LX.OnlineSource
  tagId: string
  tagName: string
  onTagChange: (name: string, id: string) => void
}

export default ({ source, tagId, tagName, onTagChange }: TagSelectorProps) => {
  const theme = useTheme()
  const t = useI18n()
  const [hotTag, setHotTag] = useState<TagInfoItem[]>([])
  const [groups, setGroups] = useState<TagInfoTypeItem[]>([])
  const [visible, setVisible] = useState(false)
  const isUnmountedRef = useRef(false)

  useEffect(() => {
    isUnmountedRef.current = false
    setHotTag([])
    setGroups([])
    void getTags(source).then(tagInfo => {
      if (isUnmountedRef.current) return
      setHotTag(tagInfo.hotTag)
      setGroups(tagInfo.tags.filter(g => g.list.length))
    }).catch(() => {})
    return () => {
      isUnmountedRef.current = true
    }
  }, [source])

  const items = useMemo<ChipItem[]>(() => {
    const list: ChipItem[] = [{ id: '', name: t('songlist_tag_default') }, ...hotTag.map(tag => ({ id: tag.id, name: tag.name }))]
    if (tagId && !list.some(i => i.id == tagId)) list.splice(1, 0, { id: tagId, name: tagName })
    return list
  }, [hotTag, tagId, tagName, t])

  const handleSelectAll = (name: string, id: string) => {
    setVisible(false)
    onTagChange(name, id)
  }

  return (
    <>
      <ChipBar
        items={items}
        activeId={tagId}
        onSelect={(id) => {
          const item = items.find(i => i.id == id)
          if (item) onTagChange(item.name, item.id)
        }}
        trailing={
          <TouchableOpacity
            activeOpacity={.7}
            onPress={() => { setVisible(true) }}
            style={{ ...styles.moreChip, backgroundColor: theme['c-button-background'] }}
          >
            <Icon name="menu" size={13} color={theme['c-font']} />
            <Text size={13} color={theme['c-font']} style={styles.moreChipText}>{t('songlist_tag_all')}</Text>
          </TouchableOpacity>
        }
      />
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        hardwareAccelerated
        onRequestClose={() => { setVisible(false) }}
      >
        <TouchableWithoutFeedback onPress={() => { setVisible(false) }}>
          <View style={styles.backdrop}>
            <Pressable onPress={() => {}} style={{ ...styles.sheet, backgroundColor: theme['c-content-background'] }}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle} size={17} color={theme['c-font']}>{t('songlist_tag_all')}</Text>
                <TouchableOpacity style={styles.closeBtn} activeOpacity={.6} onPress={() => { setVisible(false) }}>
                  <Icon name="close" size={16} color={theme['c-font']} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.sheetScroll} keyboardShouldPersistTaps="always">
                <TagGroup
                  name={t('songlist_tag_hot')}
                  list={hotTag}
                  activeId={tagId}
                  onTagChange={handleSelectAll}
                />
                {
                  groups.map((group, index) => (
                    <TagGroup
                      key={index}
                      name={group.name}
                      list={group.list}
                      activeId={tagId}
                      onTagChange={handleSelectAll}
                    />
                  ))
                }
                <View style={{ height: 12 }} />
              </ScrollView>
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
}

const styles = createStyle({
  moreChip: {
    borderRadius: 16,
    marginRight: 8,
    paddingHorizontal: 12,
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreChipText: {
    marginLeft: 5,
    fontWeight: '500',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  sheetTitle: {
    flex: 1,
    fontWeight: '700',
  },
  closeBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
})

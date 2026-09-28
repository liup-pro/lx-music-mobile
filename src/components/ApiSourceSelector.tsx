import { memo, useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Text from '@/components/common/Text'
import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { useSettingValue } from '@/store/setting/hook'
import { useStatus, useUserApiList } from '@/store/userApi'
import { setApiSource } from '@/core/apiSource'
import { getActiveSource, initOnlineSource, setActiveSource, ONLINE_SOURCES } from '@/core/onlineSource'

const useCurrentSource = () => {
  const [source, setSource] = useState<LX.OnlineSource>(getActiveSource())
  useEffect(() => {
    initOnlineSource()
    setSource(getActiveSource())
    const handleUpdate = (s: LX.OnlineSource) => {
      setSource(s)
    }
    global.state_event.on('onlineSourceUpdated', handleUpdate)
    return () => {
      global.state_event.off('onlineSourceUpdated', handleUpdate)
    }
  }, [])
  return source
}

export default memo(() => {
  const theme = useTheme()
  const t = useI18n()
  const [visible, setVisible] = useState(false)
  const apiSourceSetting = useSettingValue('common.apiSource')
  const sourceNameType = useSettingValue('common.sourceNameType')
  const userApiListRaw = useUserApiList()
  const apiStatus = useStatus()
  const currentSource = useCurrentSource()

  const apiList = useMemo(() => {
    const getStatusLabel = () => {
      if (apiStatus.status) return t('setting_basic_source_status_success')
      if (apiStatus.message == 'initing') return t('setting_basic_source_status_initing')
      return t('setting_basic_source_status_failed')
    }
    return userApiListRaw.map(api => ({
      id: api.id,
      label: `${api.name}${[/^\d/.test(api.version) ? `v${api.version}` : api.version].filter(Boolean).length ? ` (${[/^\d/.test(api.version) ? `v${api.version}` : api.version].filter(Boolean).join(', ')})` : ''}`,
      status: api.id == apiSourceSetting ? `[${getStatusLabel()}]` : '',
    }))
  }, [userApiListRaw, apiStatus, apiSourceSetting, t])

  const activeApi = apiList.find(i => i.id == apiSourceSetting)

  const handleSelectApi = (id: string) => {
    setApiSource(id)
    setVisible(false)
  }
  const handleSelectSite = (source: LX.OnlineSource) => {
    setActiveSource(source)
    setVisible(false)
  }

  return (
    <>
      <TouchableOpacity
        style={{ ...styles.pill, backgroundColor: theme['c-primary-alpha-900'] }}
        activeOpacity={.7}
        onPress={() => { setVisible(true) }}
      >
        <Text size={11} numberOfLines={1} color={theme['c-primary-font-active']} style={styles.pillText}>
          {t(`source_${sourceNameType}_${currentSource}`)}
        </Text>
      </TouchableOpacity>
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
              <Text style={styles.sheetTitle} size={17} color={theme['c-font']}>{t('api_source_title')}</Text>
              <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.groupTitle} size={12} color={theme['c-font-label']}>{t('source_site_section')}</Text>
                {
                  ONLINE_SOURCES.map(source => {
                    const active = source == currentSource
                    return (
                      <TouchableOpacity
                        key={source}
                        style={{ ...styles.row, borderBottomColor: theme['c-border-background'] }}
                        activeOpacity={.6}
                        onPress={() => { handleSelectSite(source) }}
                      >
                        <View style={styles.rowLabel}>
                          <Text size={15} color={active ? theme['c-primary-font-active'] : theme['c-font']}>
                            {t(`source_${sourceNameType}_${source}`)}
                          </Text>
                        </View>
                        {active ? <Icon name="checkbox-marked" size={18} color={theme['c-primary-font-active']} /> : null}
                      </TouchableOpacity>
                    )
                  })
                }
                {
                  apiList.length ? (
                    <>
                      <Text style={styles.groupTitle} size={12} color={theme['c-font-label']}>{t('source_api_section')}</Text>
                      {
                        apiList.map(item => {
                          const active = item.id == apiSourceSetting
                          return (
                            <TouchableOpacity
                              key={item.id}
                              style={{ ...styles.row, borderBottomColor: theme['c-border-background'] }}
                              activeOpacity={.6}
                              onPress={() => { handleSelectApi(item.id) }}
                            >
                              <View style={styles.rowLabel}>
                                <Text size={15} numberOfLines={1} color={active ? theme['c-primary-font-active'] : theme['c-font']}>
                                  {item.label}
                                </Text>
                                {item.status ? <Text size={11} color={theme['c-font-label']}>{item.status}</Text> : null}
                              </View>
                              {active ? <Icon name="checkbox-marked" size={18} color={theme['c-primary-font-active']} /> : null}
                            </TouchableOpacity>
                          )
                        })
                      }
                    </>
                  ) : null
                }
                <View style={{ height: 8 }} />
              </ScrollView>
              <TouchableOpacity
                style={{ ...styles.cancelBtn, backgroundColor: activeApi ? theme['c-button-background'] : theme['c-button-background'] }}
                activeOpacity={.6}
                onPress={() => { setVisible(false) }}
              >
                <Text size={16} color={theme['c-font']} style={styles.cancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
              <View style={styles.safeArea} />
            </Pressable>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  )
})

const styles = createStyle({
  pill: {
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    marginRight: 4,
  },
  pillText: {
    fontWeight: '600',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 18,
    maxHeight: '70%',
  },
  sheetTitle: {
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  sheetScroll: {
    flexGrow: 0,
    flexShrink: 1,
  },
  groupTitle: {
    marginLeft: 20,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingRight: 10,
  },
  cancelBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontWeight: '600',
  },
  safeArea: {
    height: 20,
  },
})

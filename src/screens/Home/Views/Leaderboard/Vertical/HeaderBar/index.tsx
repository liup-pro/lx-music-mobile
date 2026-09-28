import { forwardRef, useImperativeHandle, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { useI18n } from '@/lang'

export interface HeaderBarProps {
  onPlay: () => void
  onCollect: () => void
}

export interface HeaderBarType {
  setBound: (name: string) => void
}


export default forwardRef<HeaderBarType, HeaderBarProps>(({ onPlay, onCollect }, ref) => {
  const theme = useTheme()
  const t = useI18n()
  const [name, setName] = useState('')

  useImperativeHandle(ref, () => ({
    setBound(name) {
      setName(name)
    },
  }), [])

  return (
    <View style={styles.wrap}>
      <View style={{ ...styles.card, backgroundColor: theme['c-button-background'] }}>
        <Text style={styles.name} numberOfLines={1} size={17} color={theme['c-font']}>{name}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={{ ...styles.btn, backgroundColor: theme['c-primary-background-active'] }} activeOpacity={.7} onPress={onPlay}>
            <Icon name="play-outline" size={13} color={theme['c-button-font']} />
            <Text size={12} color={theme['c-button-font']} style={styles.btnText}>{t('play_all')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ ...styles.btn, backgroundColor: theme['c-primary-alpha-900'] }} activeOpacity={.7} onPress={onCollect}>
            <Icon name="love" size={13} color={theme['c-primary-font-active']} />
            <Text size={12} color={theme['c-primary-font-active']} style={styles.btnText}>{t('collect')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
})

const styles = createStyle({
  wrap: {
    paddingHorizontal: 12,
    paddingTop: 4,
    paddingBottom: 8,
    zIndex: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 8,
    height: 56,
  },
  name: {
    flex: 1,
    fontWeight: '700',
    marginRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 10,
    height: 30,
    marginLeft: 6,
  },
  btnText: {
    marginLeft: 4,
    fontWeight: '500',
  },
})

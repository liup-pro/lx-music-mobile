import { forwardRef, useImperativeHandle, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { useI18n } from '@/lang'
import { BorderWidths } from '@/theme'

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
    <View style={{ ...styles.container, borderBottomColor: theme['c-border-background'] }}>
      <Text style={styles.name} numberOfLines={1} size={18} color={theme['c-font']}>{name}</Text>
      <TouchableOpacity style={{ ...styles.btn, backgroundColor: theme['c-primary-background-active'] }} activeOpacity={.7} onPress={onPlay}>
        <Icon name="play-outline" size={12} color={theme['c-button-font']} />
        <Text size={12} color={theme['c-button-font']} style={styles.btnText}>{t('play_all')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ ...styles.btn, backgroundColor: theme['c-primary-alpha-900'] }} activeOpacity={.7} onPress={onCollect}>
        <Icon name="love" size={12} color={theme['c-primary-font-active']} />
        <Text size={12} color={theme['c-primary-font-active']} style={styles.btnText}>{t('collect')}</Text>
      </TouchableOpacity>
    </View>
  )
})

const styles = createStyle({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingLeft: 14,
    paddingRight: 10,
    borderBottomWidth: BorderWidths.normal,
    zIndex: 2,
  },
  name: {
    flex: 1,
    fontWeight: '800',
    marginRight: 8,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 28,
    marginLeft: 6,
  },
  btnText: {
    marginLeft: 3,
    fontWeight: '600',
  },
})

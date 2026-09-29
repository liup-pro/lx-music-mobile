import { TouchableOpacity, View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import { Icon } from '@/components/common/Icon'
import Text from '@/components/common/Text'
import { useI18n } from '@/lang'
import { useStatusbarHeight } from '@/store/common/hook'
import { pop } from '@/navigation'
import commonState from '@/store/common/state'
import { COMPONENT_IDS } from '@/config/constant'
import { BorderWidths } from '@/theme'

export interface HeaderProps {
  name: string
  onPlay: () => void
  onCollect: () => void
}

export default ({ name, onPlay, onCollect }: HeaderProps) => {
  const theme = useTheme()
  const t = useI18n()
  const statusBarHeight = useStatusbarHeight()

  const back = () => {
    void pop(commonState.componentIds[COMPONENT_IDS.leaderboardDetail]!)
  }

  return (
    <View style={{ ...styles.container, paddingTop: statusBarHeight, borderBottomColor: theme['c-border-background'] }}>
      <View style={styles.row}>
        <TouchableOpacity activeOpacity={.6} onPress={back} style={{ ...styles.back, backgroundColor: theme['c-button-background'] }}>
          <Icon name="chevron-left" size={17} color={theme['c-font']} />
        </TouchableOpacity>
        <View style={styles.titleBox}>
          <Text size={19} color={theme['c-font']} numberOfLines={1} style={styles.name}>{name}</Text>
          <Text size={11} color={theme['c-font-label']} numberOfLines={1}>{t('toplist_desc')}</Text>
        </View>
        <TouchableOpacity style={{ ...styles.btn, backgroundColor: theme['c-primary-background-active'] }} activeOpacity={.7} onPress={onPlay}>
          <Icon name="play-outline" size={12} color={theme['c-button-font']} />
          <Text size={12} color={theme['c-button-font']} style={styles.btnText}>{t('play_all')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{ ...styles.btn, backgroundColor: theme['c-primary-alpha-900'] }} activeOpacity={.7} onPress={onCollect}>
          <Icon name="love" size={12} color={theme['c-primary-font-active']} />
          <Text size={12} color={theme['c-primary-font-active']} style={styles.btnText}>{t('collect')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = createStyle({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 10,
    borderBottomWidth: BorderWidths.normal,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  back: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleBox: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontWeight: '800',
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 10,
    height: 28,
    marginLeft: 6,
    flexShrink: 0,
  },
  btnText: {
    marginLeft: 3,
    fontWeight: '600',
  },
})

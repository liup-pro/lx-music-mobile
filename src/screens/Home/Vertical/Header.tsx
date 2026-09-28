import { TouchableOpacity, View } from 'react-native'
import { useTheme } from '@/store/theme/hook'
import { useNavActiveId, useStatusbarHeight } from '@/store/common/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import StatusBar from '@/components/common/StatusBar'
import { Icon } from '@/components/common/Icon'
import ApiSourceSelector from '@/components/ApiSourceSelector'
import { scaleSizeH } from '@/utils/pixelRatio'
import { HEADER_HEIGHT } from '@/config/constant'
import { type InitState as CommonState } from '@/store/common/state'
import { setNavActiveId } from '@/core/common'
import SearchTypeSelector from '@/screens/Home/Views/Search/SearchTypeSelector'
import OpenList from '@/screens/Home/Views/SongList/HeaderBar/OpenList'

const headerComponents: Partial<Record<CommonState['navActiveId'], React.ReactNode>> = {
  nav_search: <SearchTypeSelector />,
  nav_songlist: <OpenList />,
}

const Header = () => {
  const theme = useTheme()
  const t = useI18n()
  const id = useNavActiveId()
  const statusBarHeight = useStatusbarHeight()
  const isHome = id == 'nav_home'

  return (
    <>
      <StatusBar />
      <View style={{
        ...styles.container,
        height: scaleSizeH(HEADER_HEIGHT) + statusBarHeight,
        paddingTop: statusBarHeight,
        backgroundColor: theme['c-content-background'],
      }}>
        {
          isHome ? (
            <View style={styles.homeRow}>
              <Text style={styles.title} size={22} color={theme['c-font']}>{t(id)}</Text>
              <View style={styles.actions}>
                <ApiSourceSelector />
                <TouchableOpacity style={styles.headerIcon} activeOpacity={.6} onPress={() => { setNavActiveId('nav_search') }}>
                  <Icon name="search-2" size={21} color={theme['c-font']} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerIcon} activeOpacity={.6} onPress={() => { setNavActiveId('nav_setting') }}>
                  <Icon name="setting" size={21} color={theme['c-font']} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <Text style={styles.title} size={20} color={theme['c-font']} numberOfLines={1}>{t(id)}</Text>
              {headerComponents[id] ?? null}
            </>
          )
        }
      </View>
    </>
  )
}


const styles = createStyle({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    zIndex: 10,
  },
  homeRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontWeight: '700',
    paddingLeft: 16,
    paddingRight: 8,
  },
  headerIcon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
})

export default Header

import { useRef } from 'react'
import { ScrollView, View } from 'react-native'

import NavList from './NavList'
import Main, { type MainType } from '../Main'
import { createStyle } from '@/utils/tools'
import { BorderWidths } from '@/theme'
import { useTheme } from '@/store/theme/hook'

// 竖屏设置页：顶部胶囊分类条 + 下方仅渲染当前分类（每页少量配置），避免所有分区纵向堆叠过长
export default () => {
  const theme = useTheme()
  const mainRef = useRef<MainType>(null)

  return (
    <View style={{ ...styles.container, borderBottomColor: theme['c-border-background'] }}>
      <NavList onChangeId={(id) => mainRef.current?.setActiveId(id)} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="always"
      >
        <Main ref={mainRef} />
      </ScrollView>
    </View>
  )
}

const styles = createStyle({
  container: {
    flex: 1,
    flexDirection: 'column',
    borderBottomWidth: BorderWidths.normal,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 15,
    paddingBottom: 15,
  },
})

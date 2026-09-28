import { View } from 'react-native'

import MyList from './MyList'
import MusicList from './MusicList'
import { createStyle } from '@/utils/tools'

export default () => {
  return (
    <View style={styles.container}>
      <MyList />
      <MusicList />
    </View>
  )
}

const styles = createStyle({
  container: {
    flex: 1,
    width: '100%',
  },
})

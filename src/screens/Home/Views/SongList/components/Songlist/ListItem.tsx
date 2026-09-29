import { memo } from 'react'
import { View } from 'react-native'
import { createStyle } from '@/utils/tools'
import { type ListInfoItem } from '@/store/songlist/state'
import Text from '@/components/common/Text'
import { scaleSizeW } from '@/utils/pixelRatio'
import { NAV_SHEAR_NATIVE_IDS } from '@/config/constant'
import CoverCard from '@/components/common/CoverCard'

const gap = scaleSizeW(20)

export default memo(({ item, index, width, showSource, onPress }: {
  item: ListInfoItem
  index: number
  showSource: boolean
  width: number
  onPress: (item: ListInfoItem, index: number) => void
}) => {
  const itemWidth = width - gap
  const handlePress = () => {
    onPress(item, index)
  }
  return (
    item.source
      ? (
          <View style={{ ...styles.listItem, width: itemWidth }}>
            <CoverCard
              img={item.img}
              title={item.name}
              subtitle={item.desc || item.author}
              playCount={item.play_count}
              width={itemWidth}
              radius={16}
              onPress={handlePress}
              nativeID={`${NAV_SHEAR_NATIVE_IDS.songlistDetail_pic}_from_${item.id}`}
            />
            { showSource ? <Text style={styles.sourceLabel} size={9} color="#fff">{item.source}</Text> : null }
          </View>
        )
      : <View style={{ ...styles.listItem, width: itemWidth }} />
  )
})

const styles = createStyle({
  listItem: {
    position: 'relative',
    marginBottom: 18,
  },
  sourceLabel: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    position: 'absolute',
    top: 6,
    left: 6,
    borderRadius: 6,
    zIndex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
})

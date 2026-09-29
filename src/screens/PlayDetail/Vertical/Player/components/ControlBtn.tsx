import { Pressable, View } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useTheme } from '@/store/theme/hook'
// import { useIsPlay } from '@/store/player/hook'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { useIsPlay } from '@/store/player/hook'
import { useI18n } from '@/lang'
import { createStyle } from '@/utils/tools'
import { useWindowSize } from '@/utils/hooks'
import { BTN_WIDTH } from './MoreBtn/Btn'
import { useMemo } from 'react'

// 图标按钮采用 borderless 水波纹，无需背景即可在热区内扩散，符合 Material 图标按钮观感
const useRipple = () => {
  const theme = useTheme()
  return useMemo(() => ({ color: theme['c-primary-light-200-alpha-700'], borderless: true }), [theme])
}

const PrevBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const t = useI18n()
  const ripple = useRipple()
  const handlePlayPrev = () => {
    void playPrev()
  }
  return (
    <Pressable style={{ ...styles.cotrolBtn, width: size, height: size }} android_ripple={ripple} accessibilityRole='button' accessibilityLabel={t('play_prev')} onPress={handlePlayPrev}>
      {({ pressed }) => <Icon name='prevMusic' style={{ opacity: pressed ? 0.6 : 1 }} color={theme['c-button-font']} rawSize={size * 0.7} />}
    </Pressable>
  )
}
const NextBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const t = useI18n()
  const ripple = useRipple()
  const handlePlayNext = () => {
    void playNext()
  }
  return (
    <Pressable style={{ ...styles.cotrolBtn, width: size, height: size }} android_ripple={ripple} accessibilityRole='button' accessibilityLabel={t('play_next')} onPress={handlePlayNext}>
      {({ pressed }) => <Icon name='nextMusic' style={{ opacity: pressed ? 0.6 : 1 }} color={theme['c-button-font']} rawSize={size * 0.7} />}
    </Pressable>
  )
}

const TogglePlayBtn = ({ size }: { size: number }) => {
  const theme = useTheme()
  const t = useI18n()
  const ripple = useRipple()
  const isPlay = useIsPlay()
  return (
    <Pressable style={{ ...styles.cotrolBtn, width: size, height: size }} android_ripple={ripple} accessibilityRole='button' accessibilityLabel={t(isPlay ? 'pause' : 'play')} accessibilityState={{ checked: isPlay }} onPress={togglePlay}>
      {({ pressed }) => <Icon name={isPlay ? 'pause' : 'play'} style={{ opacity: pressed ? 0.6 : 1 }} color={theme['c-button-font']} rawSize={size * 0.7} />}
    </Pressable>
  )
}

const MAX_SIZE = BTN_WIDTH * 1.6
const MIN_SIZE = BTN_WIDTH * 1.2

export default () => {
  const winSize = useWindowSize()
  const maxHeight = Math.max(winSize.height * 0.11, MIN_SIZE)
  const containerStyle = useMemo(() => {
    return {
      ...styles.conatiner,
      maxHeight,
    }
  }, [maxHeight])
  const size = Math.min(Math.max(winSize.width * 0.33 * global.lx.fontSize * 0.4, MIN_SIZE), MAX_SIZE, maxHeight)

  return (
    <View style={containerStyle}>
      <PrevBtn size={size} />
      <TogglePlayBtn size={size} />
      <NextBtn size={size} />
    </View>
  )
}


const styles = createStyle({
  conatiner: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: '4%',
    paddingVertical: 22,
    // backgroundColor: 'rgba(0, 0, 0, .1)',
  },
  cotrolBtn: {
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: '#ccc',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
})

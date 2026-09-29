import { Pressable } from 'react-native'
import { Icon } from '@/components/common/Icon'
import { useIsPlay } from '@/store/player/hook'
import { useTheme } from '@/store/theme/hook'
import { useI18n } from '@/lang'
import { playNext, playPrev, togglePlay } from '@/core/player/player'
import { createStyle } from '@/utils/tools'
import { useHorizontalMode } from '@/utils/hooks'
import { useMemo } from 'react'

const BTN_SIZE = 24
const handlePlayPrev = () => {
  void playPrev()
}
const handlePlayNext = () => {
  void playNext()
}

// 图标按钮采用 borderless 水波纹，无需背景即可在热区内扩散
const useRipple = () => {
  const theme = useTheme()
  return useMemo(() => ({ color: theme['c-primary-light-200-alpha-700'], borderless: true }), [theme])
}

const PlayPrevBtn = () => {
  const theme = useTheme()
  const t = useI18n()
  const ripple = useRipple()

  return (
    <Pressable style={styles.cotrolBtn} android_ripple={ripple} accessibilityRole='button' accessibilityLabel={t('play_prev')} onPress={handlePlayPrev}>
      {({ pressed }) => <Icon name='prevMusic' style={{ opacity: pressed ? 0.6 : 1 }} color={theme['c-button-font']} size={BTN_SIZE} />}
    </Pressable>
  )
}

const PlayNextBtn = () => {
  const theme = useTheme()
  const t = useI18n()
  const ripple = useRipple()

  return (
    <Pressable style={styles.cotrolBtn} android_ripple={ripple} accessibilityRole='button' accessibilityLabel={t('play_next')} onPress={handlePlayNext}>
      {({ pressed }) => <Icon name='nextMusic' style={{ opacity: pressed ? 0.6 : 1 }} color={theme['c-button-font']} size={BTN_SIZE} />}
    </Pressable>
  )
}

const TogglePlayBtn = () => {
  const isPlay = useIsPlay()
  const theme = useTheme()
  const t = useI18n()
  const ripple = useRipple()

  return (
    <Pressable style={styles.cotrolBtn} android_ripple={ripple} accessibilityRole='button' accessibilityLabel={t(isPlay ? 'pause' : 'play')} accessibilityState={{ checked: isPlay }} onPress={togglePlay}>
      {({ pressed }) => <Icon name={isPlay ? 'pause' : 'play'} style={{ opacity: pressed ? 0.6 : 1 }} color={theme['c-button-font']} size={BTN_SIZE} />}
    </Pressable>
  )
}

export default () => {
  const isHorizontalMode = useHorizontalMode()
  return (
    <>
      { isHorizontalMode ? <PlayPrevBtn /> : null }
      <TogglePlayBtn />
      <PlayNextBtn />
    </>
  )
}


const styles = createStyle({
  cotrolBtn: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',

    // backgroundColor: '#ccc',
    shadowOpacity: 1,
    textShadowRadius: 1,
  },
})

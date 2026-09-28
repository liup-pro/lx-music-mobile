import { useRef } from 'react'
import { TouchableOpacity } from 'react-native'

import Modal, { type ModalType } from './Modal'
import { createStyle } from '@/utils/tools'
import Text from '@/components/common/Text'
import { useI18n } from '@/lang'
import { useTheme } from '@/store/theme/hook'
import { navigations } from '@/navigation'
import commonState from '@/store/common/state'
import { getActiveSource } from '@/core/onlineSource'
import { type Source } from '@/store/songlist/state'


export default () => {
  const t = useI18n()
  const theme = useTheme()
  const modalRef = useRef<ModalType>(null)
  const sourceRef = useRef<Source>(getActiveSource() as Source)

  const getSource = () => {
    const source = getActiveSource() as Source
    sourceRef.current = source
    return source
  }

  const handleOpenSonglist = (id: string) => {
    navigations.pushSonglistDetailScreen(commonState.componentIds.home!, {
      play_count: undefined,
      id,
      author: '',
      name: '',
      img: undefined,
      desc: undefined,
      source: sourceRef.current,
    })
  }

  return (
    <>
      <TouchableOpacity style={styles.button} activeOpacity={.6} onPress={() => { modalRef.current?.show(getSource()) }}>
        <Text size={14} color={theme['c-primary-font-active']} numberOfLines={1}>{t('songlist_open')}</Text>
      </TouchableOpacity>
      <Modal ref={modalRef} onOpenId={handleOpenSonglist} />
    </>
  )
}

const styles = createStyle({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
})

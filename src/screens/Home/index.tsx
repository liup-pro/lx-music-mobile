import { useCallback, useEffect } from 'react'
import { useHorizontalMode } from '@/utils/hooks'
import PageContent from '@/components/PageContent'
import { setComponentId, setNavActiveId } from '@/core/common'
import { COMPONENT_IDS } from '@/config/constant'
import Vertical from './Vertical'
import Horizontal from './Horizontal'
import { navigations } from '@/navigation'
import settingState from '@/store/setting/state'
import commonState from '@/store/common/state'
import { useBackHandler } from '@/utils/hooks/useBackHandler'


interface Props {
  componentId: string
}


export default ({ componentId }: Props) => {
  const isHorizontalMode = useHorizontalMode()
  // 统一返回行为（横竖屏一致）：栈内推入详情页时交给导航 pop（退上一级）；否则处于非主页子视图先回到主页 tab，仅主页 tab 才退出到桌面
  useBackHandler(useCallback(() => {
    if (Object.keys(commonState.componentIds).length > 1) return false
    if (commonState.navActiveId != 'nav_home') {
      setNavActiveId('nav_home')
      return true
    }
    return false
  }, []))
  useEffect(() => {
    setComponentId(COMPONENT_IDS.home, componentId)
    // eslint-disable-next-line react-hooks/exhaustive-deps

    if (settingState.setting['player.startupPushPlayDetailScreen']) {
      navigations.pushPlayDetailScreen(componentId, true)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <PageContent>
      {
        isHorizontalMode
          ? <Horizontal />
          : <Vertical />
      }
    </PageContent>
  )
}

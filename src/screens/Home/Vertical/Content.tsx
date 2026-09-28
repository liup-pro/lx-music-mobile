import Header from './Header'
import Main from './Main'
import BottomTab from './BottomTab'
import PlayerBar from '@/components/player/PlayerBar'

const Content = () => {
  return (
    <>
      <Header />
      <Main />
      <PlayerBar isHome />
      <BottomTab />
    </>
  )
}

export default Content

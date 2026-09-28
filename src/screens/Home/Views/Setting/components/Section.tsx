import { View } from 'react-native'

import { createStyle } from '@/utils/tools'
import { useTheme } from '@/store/theme/hook'
import Text from '@/components/common/Text'


interface Props {
  title: string
  children: React.ReactNode | React.ReactNode[]
}

export default ({ title, children }: Props) => {
  const theme = useTheme()

  return (
    <View style={styles.container}>
      <Text style={styles.title} size={17} color={theme['c-font']}>{title}</Text>
      <View style={{ ...styles.card, backgroundColor: theme['c-primary-alpha-900'] }}>
        {children}
      </View>
    </View>
  )
}


const styles = createStyle({
  container: {
    marginBottom: 20,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
})

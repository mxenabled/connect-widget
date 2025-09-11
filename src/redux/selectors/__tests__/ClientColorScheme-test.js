import { getPrimarySeedColor } from 'src/redux/selectors/ClientColorScheme'

describe('ClientcolorScheme Selectors', () => {
  let state = {
    config: {
      color_scheme: 'light',
    },
    profiles: {
      clientColorScheme: {
        widget_brand_color: '#bada55',
      },
    },
  }
  describe('getPrimarySeedColor', () => {
    it('should return widget_brand_color if it exists', () => {
      const res = getPrimarySeedColor(state)

      expect(res).toEqual(state.profiles.clientColorScheme.widget_brand_color)
    })

    it('should return primary_300 if widget_brand_color does not exist', () => {
      state = {
        config: {
          color_scheme: 'light',
        },
        profiles: {
          clientColorScheme: {
            primary_100: '100',
            primary_200: '200',
            primary_300: '300',
            primary_400: '400',
            primary_500: '500',
          },
        },
      }

      const res = getPrimarySeedColor(state)

      expect(res).toEqual(state.profiles.clientColorScheme.primary_300)
    })

    it('should return undefined if neither widget_brand_color or primary_300 exist', () => {
      state = {
        config: {
          color_scheme: 'light',
        },
        profiles: {
          clientColorScheme: {
            primary_100: '100',
            primary_200: '200',
            primary_400: '400',
            primary_500: '500',
          },
        },
      }
      const res = getPrimarySeedColor(state)

      expect(res).toBeUndefined()
    })
  })
})

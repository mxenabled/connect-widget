import { render, screen } from '@testing-library/react'

import ConnectWidget from '../ConnectWidget'

describe('ConnectWidget', () => {
  it('renders headline', () => {
    render(<ConnectWidget />)
    expect(screen.getByText('Connect widget')).toBeInTheDocument()
  })
})

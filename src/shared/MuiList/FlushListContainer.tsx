import React, { ReactNode } from 'react'

import styles from 'src/shared/MuiList/FlushListContainer.module.css'

export const FlushListContainer = ({ children }: { children: ReactNode }) => (
  <div className={styles.container}>{children}</div>
)

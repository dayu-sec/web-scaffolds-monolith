import type { ReactNode } from 'react';

import styles from './OperationalPage.module.css';

interface OperationalPageProps {
  /**
   * 面包屑下方的紧凑操作区。
   */
  actions?: ReactNode;
  /**
   * 页面主要内容前的状态条。
   */
  stateStrip?: ReactNode;
  /**
   * 页面主体工作流内容。
   */
  children: ReactNode;
}

/** 为检索、详情等运维页面提供统一的操作区、状态条和内容承载结构。 */
export default function OperationalPage({ actions, stateStrip, children }: OperationalPageProps) {
  return (
    <main className={styles.page}>
      <div className={styles.inner}>
        {actions ? (
          <div className={styles.actionsRow}>
            <div className={styles.actions}>{actions}</div>
          </div>
        ) : null}
        {stateStrip ? <section className={styles.stateStrip}>{stateStrip}</section> : null}
        <section className={styles.content}>{children}</section>
      </div>
    </main>
  );
}

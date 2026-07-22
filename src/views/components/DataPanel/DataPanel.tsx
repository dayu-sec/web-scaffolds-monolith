import { Spin } from 'antd';
import type { ReactNode } from 'react';

import styles from './DataPanel.module.css';

type DataPanelStateType = 'disabled' | 'empty' | 'error' | 'loading';

interface DataPanelState {
  type: DataPanelStateType;
  title: string;
  description?: string;
}

interface DataPanelProps {
  /**
   * 页面级尺寸扩展类，不改变面板语义。
   */
  className?: string;
  /**
   * 面板标题。
   */
  title: string;
  /**
   * 标题下方的辅助说明。
   */
  meta?: string;
  /**
   * 标题区域的紧凑操作区。
   */
  actions?: ReactNode;
  /**
   * 可选的加载、空、错误或禁用状态；传入后替代主体内容。
   */
  state?: DataPanelState;
  /**
   * 面板主体内容。
   */
  children?: ReactNode;
  /**
   * 主体滚动或撑满高度时使用的扩展类。
   */
  bodyClassName?: string;
  /**
   * 可选的面板底部辅助信息。
   */
  footer?: ReactNode;
}

/** 业务页面通用的紧凑面板，明确承载标题、说明、操作和生命周期状态。 */
export default function DataPanel({
  className,
  title,
  meta,
  actions,
  state,
  children,
  bodyClassName,
  footer,
}: DataPanelProps) {
  const isDisabled = state?.type === 'disabled';

  return (
    <article className={`${styles.panel} ${isDisabled ? styles.disabled : ''} ${className ?? ''}`}>
      <header className={styles.header}>
        <div>
          <h3 className={styles.title}>{title}</h3>
          {meta ? <div className={styles.meta}>{meta}</div> : null}
        </div>
        {actions ? <div className={styles.actions}>{actions}</div> : null}
      </header>
      <div className={`${styles.body} ${bodyClassName ?? ''}`}>{state ? <PanelState state={state} /> : children}</div>
      {footer ? <footer className={styles.footer}>{footer}</footer> : null}
    </article>
  );
}

function PanelState({ state }: { state: DataPanelState }) {
  return (
    <div className={`${styles.state} ${state.type === 'error' ? styles.error : ''}`} role="status">
      <div>
        {state.type === 'loading' ? <Spin size="small" /> : null}
        <span className={styles.stateTitle}>{state.title}</span>
        {state.description ? <span className={styles.stateDescription}>{state.description}</span> : null}
      </div>
    </div>
  );
}

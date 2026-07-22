import styles from './StatusPill.module.css';

export type StatusPillTone = 'active' | 'danger' | 'disabled' | 'neutral' | 'success' | 'warning';

interface StatusPillProps {
  /**
   * 标签表达的语义状态。
   */
  tone?: StatusPillTone;
  /**
   * 可见状态文本，避免状态只依赖颜色表达。
   */
  label: string;
  /**
   * 可选的紧凑补充信息。
   */
  detail?: string;
}

/** 使用文本和颜色共同表达状态的紧凑指标。 */
export default function StatusPill({ tone = 'neutral', label, detail }: StatusPillProps) {
  return (
    <span className={`${styles.pill} ${styles[tone]}`} title={detail ? `${label}: ${detail}` : label}>
      <span aria-hidden className={styles.dot} />
      <span className={styles.label}>{label}</span>
      {detail ? <span className={styles.detail}>{detail}</span> : null}
    </span>
  );
}

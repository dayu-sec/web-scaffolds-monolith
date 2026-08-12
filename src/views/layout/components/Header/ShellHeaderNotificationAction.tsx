import { Badge, Button, Tooltip } from 'antd';
import { Bell } from 'lucide-react';

/** 渲染消息通知入口占位。 */
export default function ShellHeaderNotificationAction({
  count = 0,
  onClick,
}: {
  count?: number;
  onClick?: () => void;
}) {
  return (
    <Tooltip title={onClick ? '消息通知' : '消息通知未配置'}>
      <Badge count={onClick ? count : 0} size="small">
        <Button
          aria-label={onClick ? '消息通知' : '消息通知未配置'}
          className="dy-sec-shell-action-button"
          disabled={!onClick}
          icon={<Bell className="dy-sec-shell-action-icon" size="1em" />}
          size="small"
          type="text"
          onClick={onClick}
        />
      </Badge>
    </Tooltip>
  );
}

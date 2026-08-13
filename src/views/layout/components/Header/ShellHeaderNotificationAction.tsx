import { Bell } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** 渲染消息通知入口占位。 */
export default function ShellHeaderNotificationAction({
  count = 0,
  onClick,
}: {
  count?: number;
  onClick?: () => void;
}) {
  const label = onClick ? '消息通知' : '消息通知未配置';

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        disabled={!onClick}
        onClick={onClick}
        render={<Button className="dy-sec-shell-action-button relative" size="icon" variant="ghost" />}
      >
        <Bell data-icon="inline-start" />
        {onClick && count > 0 ? (
          <Badge className="dy-sec-shell-notification-badge" variant="destructive">
            {count > 99 ? '99+' : count}
          </Badge>
        ) : null}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

import { UserCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/** 渲染用户中心接入点；未提供真实回调时不展示虚假的退出操作。 */
export default function ShellHeaderUserAction({ onClick }: { onClick?: () => void }) {
  const label = onClick ? '用户中心' : '用户中心未配置';

  return (
    <Tooltip>
      <TooltipTrigger
        aria-label={label}
        disabled={!onClick}
        onClick={onClick}
        render={<Button className="dy-sec-shell-action-button" size="icon" variant="ghost" />}
      >
        <UserCircle data-icon="inline-start" />
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

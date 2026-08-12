import { Button, Dropdown, type MenuProps } from 'antd';
import { LogOut, UserCircle } from 'lucide-react';

const userMenuItems: MenuProps['items'] = [
  {
    key: 'logout',
    icon: <LogOut size="1em" />,
    label: '退出',
  },
];

/** 渲染用户中心入口和下拉菜单；点击入口时保留 Shell 注入的用户操作回调。 */
export default function ShellHeaderUserAction({ onClick }: { onClick?: () => void }) {
  return (
    <Dropdown trigger={['click']} placement="bottomRight" menu={{ items: userMenuItems }}>
      <Button
        aria-label="用户中心"
        className="dy-sec-shell-action-button"
        onClick={onClick}
        type="text"
        size="small"
        icon={<UserCircle className="dy-sec-shell-action-icon" size="1em" />}
      />
    </Dropdown>
  );
}

import { useNavigate } from 'react-router';

import ShellFallback from '@/views/layout/components/shell/fallback/ShellFallback';

/** 显式通配路由使用的未找到页面，不参与文件路由扫描。 */
export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <ShellFallback
      state={{ kind: 'not-found', actionLabel: '返回首页' }}
      onRetry={() => {
        void navigate('/');
      }}
    />
  );
}

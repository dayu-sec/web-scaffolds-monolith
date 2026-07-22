import { useNavigate } from 'react-router';

import ExamplesView from '@/views/components/Examples/ExamplesView';

/** 将静态文件路由导航能力适配为业务视图回调。 */
export default function ExamplesRoute() {
  const navigate = useNavigate();

  return <ExamplesView onOpenDetail={() => void navigate('/examples/demo')} />;
}

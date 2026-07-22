import { useParams } from 'react-router';

import ExampleDetailView from '@/views/components/Examples/ExampleDetailView';

/** 读取动态路由参数并转换为业务视图的显式 props。 */
export default function ExampleDetailRoute() {
  const { id = '' } = useParams<{ id: string }>();

  return <ExampleDetailView id={id} />;
}

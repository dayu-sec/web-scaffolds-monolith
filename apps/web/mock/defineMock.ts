import path from 'node:path';
import { createDefineMock } from 'vite-plugin-mock-dev-server';
import { API_BASE_PATH } from '@/constants/api';

const defineMock = createDefineMock((mock) => {
  // 公共层只补齐 API 根路径；每个 Mock 入口负责声明自己的微服务名与端点。
  mock.url = path.join(API_BASE_PATH, mock.url);
});

export { defineMock };

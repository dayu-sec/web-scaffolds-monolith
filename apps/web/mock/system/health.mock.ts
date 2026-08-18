import { defineMock } from '#/defineMock';

export default defineMock({
  url: '/system/health',
  method: 'GET',
  // `enabled` 默认 true；后端就绪后把它设为 false，请求会自动透传给 server.proxy，
  // 不需要删除这个 mock 文件或改动 Vite 配置。
  enabled: true,
  body: {
    status: 'ok',
  },
});

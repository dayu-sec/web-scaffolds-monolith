import { defineMock } from '#/defineMock';

export default defineMock({
  url: '/system/health',
  method: 'GET',
  body: {
    status: 'ok',
  },
});

import { defineMock } from '#/defineMock';

export default defineMock({
  url: '/health',
  method: 'GET',
  body: {
    status: 'ok',
  },
});

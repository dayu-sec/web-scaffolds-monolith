import { defineMock } from '#/defineMock';

export default defineMock([
  {
    enabled: true,
    url: '/permissions/check',
    method: 'POST',
    body({ body }) {
      if (!Array.isArray(body) || body.length === 0) {
        return [];
      }

      return body.map(() => (Math.random() > 0.3 ? 1 : 0)); // 70% chance of returning 1
    },
  },
]);

import { defineMock } from '#/defineMock';

export default defineMock([
  {
    enabled: true,
    url: '/users',
    method: 'GET',
    body() {
      return [
        { id: 1, name: 'Alice TS', email: 'alice.ts@example.com' },
        { id: 2, name: 'Bob TS', email: 'bob.ts@example.com' },
      ];
    },
  },
]);

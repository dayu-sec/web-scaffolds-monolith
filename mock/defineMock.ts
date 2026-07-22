import path from 'node:path';

import { createDefineMock } from 'vite-plugin-mock-dev-server';

const defineMock = createDefineMock((mock) => {
  mock.url = path.join('/api/v1', mock.url);
});

export { defineMock };

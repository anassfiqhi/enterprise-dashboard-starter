import type { Preview } from '@storybook/nextjs-vite';
import React from 'react';
import { Provider } from 'react-redux';
import { createTestStore } from '../__mocks__/redux/store';
import '../app/globals.css';

const preview: Preview = {
  decorators: [
    (Story) => (
      <Provider store={createTestStore()}>
        <Story />
      </Provider>
    ),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo'  - show violations in test UI only
      // 'error' - fail CI on a11y violations
      // 'off'   - skip a11y checks entirely
      test: 'todo',
    },
  },
};

export default preview;

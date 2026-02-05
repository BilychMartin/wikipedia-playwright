import { defineConfig } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  reporter: [['html', { open: 'never' }]],
  use: {
    headless: true,
    storageState: 'auth.json',
  },
});

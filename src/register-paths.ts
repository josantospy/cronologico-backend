import { register } from 'tsconfig-paths';
import { join } from 'path';

// __dirname is the compiled file's directory (src/ or dist/)
// Going up one level gives the project root where src/ lives
register({
  baseUrl: join(__dirname, '..'),
  paths: { '@/*': ['src/*'] },
  addMatchAll: false,
});

import { vitePreprocess } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-static';

const dev = process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      // default options are shown. On some platforms
      // these options are set automatically — see below
      pages: 'build',
      assets: 'build',
      fallback: "404.html",
      precompress: false,
      strict: true,
      paths: {
        base: dev ? '' : '/shlips'
      }
    }),
    csp: {
      directives: {
        'script-src': ['self']
      },
      reportOnly: {
        'script-src': ['self'],
        'report-uri': ['/']
      }
    }
  }
};

import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html'
		})
	},
	onwarn: (warning, handler) => {
		const ignore = ['a11y-click-events-have-key-events', 'a11y-visible-non-interactive-elements'];
		if (ignore.some(code => warning.code?.includes(code))) return;
		handler(warning);
	}
};

export default config;

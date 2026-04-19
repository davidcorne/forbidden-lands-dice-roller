import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const ignoreA11y = [
	'a11y-click-events-have-key-events',
	'a11y-visible-non-interactive-elements'
];

export default defineConfig({
	plugins: [sveltekit()],
	onwarn(warning, handler) {
		if (warning.code && ignoreA11y.some(code => warning.code.includes(code))) return;
		handler(warning);
	}
});
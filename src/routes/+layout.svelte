<script>
	import '../app.css';
</script>

<slot />

<style>
	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(body) {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		background: #1a1a2e;
		color: #eee;
		min-height: 100vh;
	}

	:global(button) {
		font-family: inherit;
		cursor: pointer;
	}

	:global(select) {
		font-family: inherit;
	}
</style>
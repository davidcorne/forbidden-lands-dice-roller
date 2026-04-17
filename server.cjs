const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;
const BUILD_DIR = path.join(__dirname, 'build');

const mimeTypes = {
	'.html': 'text/html',
	'.js': 'application/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpeg'
};

const server = http.createServer((req, res) => {
	let filePath = path.join(BUILD_DIR, req.url === '/' ? 'index.html' : req.url);
	const ext = path.extname(filePath);
	const contentType = mimeTypes[ext] || 'text/plain';

	fs.readFile(filePath, (err, content) => {
		if (err) {
			if (err.code === 'ENOENT') {
				fs.readFile(path.join(BUILD_DIR, 'index.html'), (e, c) => {
					res.writeHead(200, { 'Content-Type': 'text/html' });
					res.end(c);
				});
			} else {
				res.writeHead(500);
				res.end('Server Error');
			}
		} else {
			res.writeHead(200, { 'Content-Type': contentType });
			res.end(content);
		}
	});
});

server.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}/`);
});
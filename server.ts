import { join } from 'path';
import { readFile } from 'fs/promises';

Bun.serve({
  port: 3000,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;
    const filePath = join('public', path);

    try {
      const data = await readFile(filePath);
      const contentType = getContentType(filePath);
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Type': contentType
        }
      });
    } catch (err) {
      return new Response('File not found', { status: 404 });
    }
  }
});

function getContentType(path: string): string {
  if (path.endsWith('.html')) return 'text/html';
  if (path.endsWith('.js')) return 'application/javascript';
  if (path.endsWith('.ts')) return 'application/javascript';
  if (path.endsWith('.css')) return 'text/css';
  if (path.endsWith('.wav')) return 'audio/wav';
  if (path.endsWith('.json')) return 'application/json';
  if (path.endsWith('.png')) return 'image/png';
  if (path.endsWith('.jpg') || path.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/octet-stream';
}

console.log('🌐 Server running at http://0.0.0.0:3000');

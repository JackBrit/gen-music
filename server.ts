import { join } from 'path';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

// Check which SD card mount point exists
const getSDCardPath = () => {
  const paths = ['/media/jack/track', '/Volumes/track'];
  for (const path of paths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return null;
};

Bun.serve({
  port: 3001,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname === '/' ? '/index.html' : url.pathname;

    // Handle SD card track requests
    if (path.startsWith('/sdcard/')) {
      const sdCardBasePath = getSDCardPath();
      if (!sdCardBasePath) {
        return new Response('SD card not found', { status: 404 });
      }

      const trackFile = path.replace('/sdcard/', '');

      // Handle directory listing
      if (trackFile === '' || trackFile === '/') {
        try {
          const fs = await import('fs');
          const files = fs.readdirSync(sdCardBasePath);
          const tsFiles = files.filter(file => file.endsWith('.ts'));

          return new Response(JSON.stringify(tsFiles), {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        } catch (err) {
          console.error('Error listing SD card tracks:', err);
          return new Response('[]', {
            status: 200,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      }

      // Handle individual track file
      const sdCardPath = join(sdCardBasePath, trackFile);

      try {
        if (existsSync(sdCardPath)) {
          const data = await readFile(sdCardPath, 'utf8');
          // Clean the code - remove problematic imports
          const cleanedData = cleanTrackCode(data);

          return new Response(cleanedData, {
            status: 200,
            headers: {
              'Content-Type': 'text/plain',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET',
              'Access-Control-Allow-Headers': 'Content-Type'
            }
          });
        } else {
          return new Response('SD card track not found', { status: 404 });
        }
      } catch (err) {
        console.error('Error reading SD card track:', err);
        return new Response('Error reading SD card track', { status: 500 });
      }
    }

    // Handle regular file requests
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

// Clean SD card track code - remove all imports, exports, and TypeScript syntax
function cleanTrackCode(trackCode: string): string {
  // Remove all import statements - we'll provide what's needed via function parameters
  let cleaned = trackCode.replace(/import\s+.*?from\s+['"][^'"]*['"];\s*/g, '');

  // Remove any remaining import statements (multiline imports)
  cleaned = cleaned.replace(/import\s+{[\s\S]*?}\s+from\s+['"][^'"]*['"];\s*/g, '');

  // Remove any import * statements
  cleaned = cleaned.replace(/import\s+\*\s+as\s+\w+\s+from\s+['"][^'"]*['"];\s*/g, '');

  // Convert export statements to regular declarations
  cleaned = cleaned.replace(/export\s+const\s+/g, 'const ');
  cleaned = cleaned.replace(/export\s+async\s+function\s+/g, 'async function ');
  cleaned = cleaned.replace(/export\s+function\s+/g, 'function ');

  // Remove TypeScript return type annotations from functions
  cleaned = cleaned.replace(/:\s*Promise<[^>]+>/g, '');
  cleaned = cleaned.replace(/:\s*[A-Z][a-zA-Z0-9.<>[\]|&\s]*(?=\s*[{=;])/g, '');

  // Remove TypeScript parameter type annotations
  cleaned = cleaned.replace(/\(\s*([^)]+)\s*\):/g, '($1):');
  cleaned = cleaned.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*[A-Z][a-zA-Z0-9.<>[\]|&\s]*/g, '$1');

  return cleaned;
}

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

console.log('🌐 Server running at http://0.0.0.0:3001');

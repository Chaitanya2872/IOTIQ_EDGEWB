import type { VercelRequest, VercelResponse } from '@vercel/node';

const AUTH_API_BASE = 'http://13.208.172.7:8084';
const INVENTORY_API_BASE = 'http://15.168.240.206:8082';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const fullPath = Array.isArray(path) ? '/' + path.join('/') : '/';

  // Add query params if any
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const search = url.search || '';

  const isAuth = fullPath.startsWith('/auth');
  const targetBase = isAuth ? AUTH_API_BASE : INVENTORY_API_BASE;
  const targetUrl = targetBase + fullPath + search;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...Object.fromEntries(
          Object.entries(req.headers).map(([key, value]) => [key, String(value)])
        ),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const responseBody = await response.text();

    res.status(response.status);

    response.headers.forEach((value, key) => {
      if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    res.send(responseBody);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Internal Server Error');
  }
}

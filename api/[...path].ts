import { VercelRequest, VercelResponse } from '@vercel/node';

const AUTH_API_BASE = 'http://13.208.172.7:8084';
const INVENTORY_API_BASE = 'http://15.168.240.206:8082';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path } = req.query;
  const fullPath = Array.isArray(path) ? '/' + path.join('/') : '/';

  const isAuth = fullPath.includes('/auth');
  const targetBase = isAuth ? AUTH_API_BASE : INVENTORY_API_BASE;
  const targetUrl = targetBase + fullPath;

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        ...Object.fromEntries(Object.entries(req.headers).map(([key, value]) => [key, String(value)])),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    const responseBody = await response.text();

    // Set status
    res.status(response.status);

    // Copy headers
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'content-length' && key.toLowerCase() !== 'transfer-encoding') {
        res.setHeader(key, value);
      }
    });

    res.send(responseBody);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).send('Internal Server Error');
  }
}
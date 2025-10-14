import type { VercelRequest, VercelResponse } from '@vercel/node';

const AUTH_API_BASE = process.env.AUTH_API_BASE_URL || 'http://13.208.172.7:8084';
const INVENTORY_API_BASE = process.env.INVENTORY_API_BASE_URL || 'http://15.168.240.206:8082';

// Enable debug logs locally
const DEBUG = process.env.NODE_ENV !== 'production';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // --- Construct full path ---
    const pathSegments = Array.isArray(req.query.path) ? req.query.path : [];
    const fullPath = '/api' + '/' + pathSegments.join('/');

    if (DEBUG) {
      console.log('Incoming request:', req.method, fullPath, 'Query:', req.query);
    }

    // --- Determine target API ---
    const isAuth = fullPath.startsWith('/api/auth');
    const targetBase = isAuth ? AUTH_API_BASE : INVENTORY_API_BASE;

    // --- Build target URL including query string ---
    const url = new URL(targetBase + fullPath);
    if (req.url?.includes('?')) {
      const queryString = req.url.split('?')[1];
      url.search = queryString;
    }

    if (DEBUG) console.log('Proxying to:', url.toString());

    // --- Forward the request ---
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Content-Type': req.headers['content-type'] || 'application/json',
        ...Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // --- Forward response status and headers ---
    res.status(response.status);
    response.headers.forEach((value, key) => {
      if (!['content-length', 'transfer-encoding'].includes(key.toLowerCase())) {
        res.setHeader(key, value);
      }
    });

    // --- Send response body ---
    const text = await response.text();
    res.send(text);

    if (DEBUG) console.log('Response forwarded with status', response.status);

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send('Internal Server Error');
  }
}

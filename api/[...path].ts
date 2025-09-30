import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import { promises as fs } from 'fs';

const AUTH_API_BASE = 'http://13.208.172.7:8084';
const INVENTORY_API_BASE = 'http://15.168.240.206:8082';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { path: reqPath } = req.query;
  const fullPath = Array.isArray(reqPath) ? '/' + reqPath.join('/') : '/';

  // Determine backend
  const isAuth = fullPath.startsWith('/auth');
  const targetBase = isAuth ? AUTH_API_BASE : INVENTORY_API_BASE;

  // Preserve query parameters
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const targetUrl = targetBase + fullPath + url.search;

  console.log("Proxying:", targetUrl);

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        ...Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, String(v)])),
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
  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).send('Internal Server Error');
  }
}

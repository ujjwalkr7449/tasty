import 'node:fs';
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = process.env.PORT || 8000;
const root = process.cwd();
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8' };

function send(response, status, body, type = 'application/json; charset=utf-8') {
  response.writeHead(status, { 'Content-Type': type });
  response.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}
function readBody(request) {
  return new Promise((resolve, reject) => { let body = ''; request.on('data', chunk => { body += chunk; if (body.length > 20_000) reject(new Error('Request too large')); }); request.on('end', () => resolve(body)); request.on('error', reject); });
}
function validOrder(order) {
  return Array.isArray(order.items) && order.items.length && order.items.every(item => typeof item.name === 'string' && Number.isFinite(item.price) && Number.isInteger(item.quantity) && item.quantity > 0) && Number.isFinite(order.total);
}
async function sendOrderEmail(order) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_NOTIFICATION_EMAIL;
  const from = process.env.ORDER_FROM_EMAIL || 'Tasty Orders <onboarding@resend.dev>';
  if (!apiKey || !to) throw new Error('Email notifications are not configured. Add RESEND_API_KEY and ORDER_NOTIFICATION_EMAIL to .env.');
  const lines = order.items.map(item => `• ${item.name} × ${item.quantity} — ₹${item.price * item.quantity}`);
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ from, to: [to], subject: `New Tasty order — ₹${order.total}`, text: `A new Tasty order has been placed.\n\n${lines.join('\n')}\n\nTotal: ₹${order.total}` }) });
  if (!response.ok) throw new Error(`Resend rejected the email (${response.status}).`);
}
async function staticFile(request, response) {
  const requested = request.url === '/' ? '/index.html' : request.url.split('?')[0];
  const file = normalize(join(root, requested));
  if (!file.startsWith(root)) return send(response, 403, 'Forbidden', 'text/plain');
  try { const info = await stat(file); if (!info.isFile()) throw new Error('Not a file'); send(response, 200, await readFile(file), types[extname(file)] || 'application/octet-stream'); } catch { send(response, 404, 'Not found', 'text/plain'); }
}

createServer(async (request, response) => {
  if (request.method === 'POST' && request.url === '/api/orders') {
    try { const order = JSON.parse(await readBody(request)); if (!validOrder(order)) return send(response, 400, { error: 'Please add at least one valid item to the order.' }); await sendOrderEmail(order); return send(response, 201, { ok: true }); } catch (error) { console.error('Order notification failed:', error.message); return send(response, 500, { error: 'We could not send the order notification. Please try again.' }); }
  }
  if (request.method === 'GET' || request.method === 'HEAD') return staticFile(request, response);
  return send(response, 405, { error: 'Method not allowed' });
}).listen(port, () => console.log(`Tasty is running on http://localhost:${port}`));

const RPC_URL = 'https://mainnet.base.org';
const ALLOWED_METHODS = new Set(['eth_chainId','eth_blockNumber','eth_gasPrice','eth_getBlockByNumber']);

async function rpc(method, params = []) {
  if (!ALLOWED_METHODS.has(method)) throw new Error('RPC method not allowed');
  const response = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: method, method, params }),
    signal: AbortSignal.timeout(7000)
  });
  const raw = await response.text();
  let payload;
  try { payload = JSON.parse(raw); }
  catch { throw new Error('Base RPC returned non-JSON content (HTTP ' + response.status + ')'); }
  if (!response.ok) throw new Error('Base RPC returned HTTP ' + response.status);
  if (payload.error) throw new Error(payload.error.message || 'Base RPC error');
  return payload.result;
}

async function handle({ request }) {
  const headers = { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' };
  if (request.method === 'GET') {
    return Response.json({ ok: true, service: 'sniper-base-network-api', route: '/api/base', methods: ['GET', 'POST'] }, { headers });
  }
  if (request.method !== 'POST') {
    return Response.json({ ok: false, error: 'Method not allowed' }, { status: 405, headers: { ...headers, allow: 'GET, POST' } });
  }
  try {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin && host && new URL(origin).host !== host) {
      return Response.json({ ok: false, error: 'Cross-origin request rejected' }, { status: 403, headers });
    }
    const body = await request.json().catch(() => ({}));
    if (body?.action !== 'network') {
      return Response.json({ ok: false, error: 'Unsupported action' }, { status: 400, headers });
    }
    const [chainId, blockNumber, gasPrice, block] = await Promise.all([
      rpc('eth_chainId'),
      rpc('eth_blockNumber'),
      rpc('eth_gasPrice'),
      rpc('eth_getBlockByNumber', ['latest', false])
    ]);
    if (Number.parseInt(chainId, 16) !== 8453 || !block) {
      return Response.json({ ok: false, error: 'RPC endpoint did not confirm Base mainnet' }, { status: 502, headers });
    }
    return Response.json({
      ok: true, network: 'base', chainId: Number.parseInt(chainId, 16),
      blockNumber, gasPrice, blockTimestamp: block.timestamp,
      transactionCount: Array.isArray(block.transactions) ? block.transactions.length : 0
    }, { headers });
  } catch (error) {
    return Response.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Base network request failed'
    }, { status: 502, headers });
  }
}

export async function onRequest(context) {
  return handle(context);
}

export async function onRequestGet(context) {
  return handle(context);
}

export async function onRequestPost(context) {
  return handle(context);
}

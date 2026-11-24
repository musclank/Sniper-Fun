import './clanker-scanner.css';

const $ = (selector, root = document) => root.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const num = value => Number.isFinite(Number(value)) ? Number(value) : 0;
const money = value => {
  const n = num(value);
  if (!n) return '—';
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(2) + 'K';
  return '$' + (n < .01 ? n.toPrecision(3) : n.toFixed(4));
};
const pick = (object, paths) => {
  for (const path of paths) {
    const value = path.split('.').reduce((item, key) => item?.[key], object);
    if (value !== undefined && value !== null && value !== '') return value;
  }
  return '';
};
const list = payload => {
  if (Array.isArray(payload)) return payload;
  for (const candidate of [payload?.trending, payload?.data?.trending, payload?.data, payload?.tokens, payload?.results, payload?.items, payload?.pools, payload?.clankers, payload?.data?.tokens, payload?.data?.results, payload?.data?.items, payload?.data?.pools]) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
};
const addressPattern = /^0x[a-f0-9]{40}$/i;

function normalize(pool, included = [], tokenMap = {}) {
  const attrs = pool?.attributes || pool || {};
  const rel = pool?.relationships || {};
  const baseId = rel?.base_token?.data?.id || rel?.baseToken?.data?.id;
  const base = included.find(item => item?.id === baseId)?.attributes || {};
  const poolAddress = pick(attrs, ['address','pool_address','poolAddress']) || String(pool?.id || '').replace(/^base_/i, '');
  const mapped = poolAddress ? (tokenMap[String(poolAddress).toLowerCase()] || tokenMap[poolAddress]) : null;
  const token = mapped || (Object.keys(base).length ? base : (pool?.token || pool?.baseToken || {}));
  const address = pick(token, ['contract_address','contractAddress','token_address','tokenAddress','address']) ||
    pick(base, ['contract_address','address']) || pick(attrs, ['token_address','token_contract_address']);
  const name = pick(token, ['name','token_name']) || pick(attrs, ['token_name','name']) || 'Unknown token';
  const symbol = pick(token, ['symbol','ticker']) || pick(attrs, ['symbol','token_symbol']) || '—';
  return {
    name: String(name), symbol: String(symbol), address: String(address || ''),
    priceUsd: pick(attrs, ['base_token_price_usd','price_usd','priceUsd']) || pick(pool, ['priceUsd','price_usd']),
    marketCapUsd: pick(attrs, ['market_cap_usd','marketCapUsd']),
    fdvUsd: pick(attrs, ['fdv_usd','fdv','fdvUsd']) || pick(pool, ['fdvUsd','fdv']),
    liquidityUsd: pick(attrs, ['reserve_in_usd','liquidity_usd','liquidityUsd']) || pick(pool, ['liquidityUsd']),
    volume24hUsd: pick(attrs, ['volume_usd.h24','volume24hUsd','volume_24h_usd','volume24h']) || pick(pool, ['volume24hUsd']),
    priceChange24h: pick(attrs, ['price_change_percentage.h24','priceChange24h','price_change_24h']) || pick(pool, ['priceChange24h']),
    pairUrl: '', dexId: '', pairCreatedAt: '', logo: ''
  };
}

function mount() {
  if ($('#sniperRadarLauncher')) return;
  const trigger = document.createElement('button');
  trigger.id = 'sniperRadarLauncher';
  trigger.className = 'sniper-radar-trigger';
  trigger.type = 'button';
  trigger.textContent = 'CLANKER RADAR';

  const overlay = document.createElement('div');
  overlay.className = 'sniper-radar-overlay';
  overlay.id = 'sniperRadarOverlay';
  overlay.hidden = true;
  overlay.innerHTML = `
    <section class="sniper-radar-dialog" role="dialog" aria-modal="true" aria-labelledby="sniperRadarTitle">
      <header class="sniper-radar-head">
        <div><span class="sniper-radar-kicker">BASE MAINNET / CLANKER INTELLIGENCE</span><h2 id="sniperRadarTitle">CLANKER <b>INTELLIGENCE RADAR</b></h2><p>Trending token discovery and evidence-based AI research</p></div>
        <button class="sniper-radar-close" type="button" aria-label="Close radar">×</button>
      </header>
      <div class="sniper-radar-toolbar"><span id="sniperRadarStatus" aria-live="polite">READY · BASE MAINNET</span><button id="sniperRadarRefresh" type="button">↻ REFRESH FEED</button></div>
      <div class="sniper-radar-grid" id="sniperRadarGrid"><div class="sniper-radar-empty">Load the Clanker feed to discover trending Base tokens.</div></div>
      <p class="sniper-radar-disclaimer">Market data may be delayed or incomplete. AI reports analyze only the displayed snapshot; they do not verify contract safety, ownership, holder distribution, or liquidity locks. Not financial advice.</p>
    </section>`;
  document.body.append(overlay);
  const topbar = $('.topbar');
  if (topbar) topbar.insertBefore(trigger, topbar.firstChild);
  const sidebar = $('.sidebar');
  const resources = $('.resources-label', sidebar || document);
  if (sidebar && resources) {
    const nav = document.createElement('button');
    nav.className = 'side-item';
    nav.type = 'button';
    nav.textContent = '◎  CLANKER RADAR';
    nav.addEventListener('click', open);
    sidebar.insertBefore(nav, resources);
  }

  const close = () => { overlay.hidden = true; };
  const open = () => { overlay.hidden = false; if (!overlay.dataset.loaded) loadFeed(); };
  trigger.addEventListener('click', open);
  $('.sniper-radar-close', overlay).addEventListener('click', close);
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !overlay.hidden) close(); });
  $('#sniperRadarRefresh', overlay).addEventListener('click', loadFeed);

  async function loadFeed() {
    const status = $('#sniperRadarStatus', overlay);
    const grid = $('#sniperRadarGrid', overlay);
    const button = $('#sniperRadarRefresh', overlay);
    button.disabled = true;
    status.textContent = 'QUERYING CLANKER TRENDING FEED…';
    try {
      const response = await fetch('/api/clanker', { headers: { accept: 'application/json' }, cache: 'no-store' });
      if (!response.ok) throw new Error('Clanker feed returned HTTP ' + response.status);
      const payload = await response.json();
      const included = Array.isArray(payload?.included) ? payload.included : [];
      const tokenMap = payload?.tokens || payload?.data?.tokens || {};
      const raw = list(payload).slice(0, 12);
      if (!raw.length) throw new Error('No trending tokens were returned');
      const tokens = raw.map(item => normalize(item, included, tokenMap));
      const validAddresses = [...new Set(tokens.map(token => token.address).filter(address => addressPattern.test(address)))];
      if (validAddresses.length) {
        const marketResponse = await fetch('https://api.dexscreener.com/tokens/v1/base/' + validAddresses.map(encodeURIComponent).join(','), { headers: { accept: 'application/json' }, cache: 'no-store' });
        if (marketResponse.ok) {
          const pairs = await marketResponse.json();
          if (Array.isArray(pairs)) {
            const best = new Map();
            for (const pair of pairs) {
              if (String(pair?.chainId).toLowerCase() !== 'base') continue;
              const address = String(pair?.baseToken?.address || '').toLowerCase();
              if (!addressPattern.test(address)) continue;
              const previous = best.get(address);
              if (!previous || num(pair?.liquidity?.usd) > num(previous?.liquidity?.usd)) best.set(address, pair);
            }
            for (const token of tokens) {
              const pair = best.get(token.address.toLowerCase());
              if (!pair) continue;
              token.priceUsd = pair.priceUsd || token.priceUsd;
              token.marketCapUsd = pair.marketCap || token.marketCapUsd;
              token.fdvUsd = pair.fdv || token.fdvUsd;
              token.liquidityUsd = pair.liquidity?.usd ?? token.liquidityUsd;
              token.volume24hUsd = pair.volume?.h24 ?? token.volume24hUsd;
              token.priceChange24h = pair.priceChange?.h24 ?? token.priceChange24h;
              token.pairUrl = pair.url || '';
              token.dexId = pair.dexId || '';
              token.pairCreatedAt = pair.pairCreatedAt ? new Date(pair.pairCreatedAt).toISOString() : '';
              token.logo = pair.info?.imageUrl || '';
            }
          }
        }
      }
      overlay.dataset.loaded = '1';
      grid.replaceChildren();
      tokens.forEach((token, index) => grid.append(renderToken(token, index)));
      status.textContent = 'LIVE FEED · ' + tokens.length + ' TOKENS · BASE';
      overlay.dataset.tokens = JSON.stringify(tokens);
    } catch (error) {
      status.textContent = 'FEED UNAVAILABLE · ' + error.message;
      grid.innerHTML = '<div class="sniper-radar-empty">Unable to retrieve the live feed. Check the Clanker Trending link or retry.</div>';
      console.error('SNIPER Clanker Radar:', error);
    } finally {
      button.disabled = false;
    }
  }

  function renderToken(token, index) {
    const card = document.createElement('article');
    card.className = 'sniper-radar-card';
    const address = addressPattern.test(token.address) ? token.address : '';
    const initials = (token.symbol && token.symbol !== '—' ? token.symbol : token.name).slice(0, 3).toUpperCase();
    const change = Number(token.priceChange24h);
    const changeLabel = Number.isFinite(change) ? (change > 0 ? '+' : '') + change.toFixed(2) + '%' : '—';
    const marketLink = token.pairUrl || (address ? 'https://dexscreener.com/base/' + encodeURIComponent(address) : 'https://www.clanker.world/clankers?filter=trending');
    card.innerHTML = `
      <div class="sniper-radar-card-head"><span class="sniper-radar-rank">${String(index + 1).padStart(2, '0')}</span><span class="sniper-radar-logo">${token.logo ? '<img src="' + esc(token.logo) + '" alt="" loading="lazy">' : esc(initials)}</span><div class="sniper-radar-name"><b>${esc(token.name)}</b><small>$${esc(token.symbol)}</small></div><strong class="${change < 0 ? 'is-down' : 'is-up'}">${esc(changeLabel)}</strong></div>
      <div class="sniper-radar-metrics"><div><small>PRICE</small><b>${money(token.priceUsd)}</b></div><div><small>LIQUIDITY</small><b>${money(token.liquidityUsd)}</b></div><div><small>24H VOLUME</small><b>${money(token.volume24hUsd)}</b></div><div><small>FDV</small><b>${money(token.fdvUsd || token.marketCapUsd)}</b></div></div>
      <div class="sniper-radar-links"><span title="${esc(address)}">${address ? esc(address.slice(0, 6) + '…' + address.slice(-4)) : 'CONTRACT NOT PROVIDED'}</span><a href="${esc(marketLink)}" target="_blank" rel="noopener noreferrer">DEXSCREENER ↗</a>${address ? '<a href="https://basescan.org/token/' + esc(address) + '" target="_blank" rel="noopener noreferrer">BASESCAN ↗</a>' : ''}</div>
      <button type="button" class="sniper-radar-research" ${address ? '' : 'disabled'}>RUN AI TOKEN RESEARCH</button>
      <div class="sniper-radar-report" hidden></div>`;
    card.querySelector('.sniper-radar-research').addEventListener('click', async event => {
      const button = event.currentTarget;
      const report = $('.sniper-radar-report', card);
      button.disabled = true;
      button.textContent = 'ANALYZING SNAPSHOT…';
      report.hidden = false;
      report.textContent = 'SNIPER AI is reviewing the available market snapshot. This may take a few seconds.';
      try {
        const response = await fetch('/api/token-research', {
          method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json' },
          body: JSON.stringify({ token: {
            name: token.name, symbol: token.symbol, address: token.address,
            priceUsd: token.priceUsd, marketCapUsd: token.marketCapUsd, fdvUsd: token.fdvUsd,
            liquidityUsd: token.liquidityUsd, volume24hUsd: token.volume24hUsd,
            priceChange24h: token.priceChange24h, pairCreatedAt: token.pairCreatedAt,
            dexId: token.dexId, pairUrl: token.pairUrl
          } })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'AI research failed');
        report.textContent = data.report;
        const model = document.createElement('small');
        model.className = 'sniper-radar-model';
        model.textContent = 'MODEL ROUTE · ' + (data.model || 'OPENROUTER FREE');
        report.append(model);
      } catch (error) {
        report.textContent = 'Research unavailable: ' + error.message;
      } finally {
        button.disabled = false;
        button.textContent = 'RUN AI RESEARCH AGAIN';
      }
    });
    return card;
  }
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
else mount();

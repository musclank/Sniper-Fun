const CLANKER_TRENDING_URL = 'https://www.clanker.world/api/tokens/trending';

export async function onRequestGet() {
  try {
    const upstream = await fetch(CLANKER_TRENDING_URL, {
      headers: { accept: 'application/json' },
      cf: { cacheTtl: 15, cacheEverything: true }
    });

    const body = await upstream.text();
    if (!upstream.ok) {
      return new Response(JSON.stringify({
        error: 'Clanker upstream returned HTTP ' + upstream.status,
        details: body.slice(0, 400)
      }), {
        status: 502,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store'
        }
      });
    }

    try {
      JSON.parse(body);
    } catch {
      return Response.json({
        error: 'Clanker upstream did not return valid JSON',
        details: body.slice(0, 300)
      }, { status: 502, headers: { 'cache-control': 'no-store' } });
    }

    return new Response(body, {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=10, s-maxage=15'
      }
    });
  } catch (error) {
    return Response.json({
      error: 'Unable to reach Clanker upstream',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 502, headers: { 'cache-control': 'no-store' } });
  }
}

export async function handler(event) {
  const ticker = (event.queryStringParameters && event.queryStringParameters.ticker) || "";
  if (!ticker) {
    return { statusCode: 400, body: JSON.stringify({ error: "ticker manquant" }) };
  }

  /* ===== CAS 1 : série FRED (préfixe FRED:) — taux souverains ===== */
  if (ticker.startsWith("FRED:")) {
    const serie = ticker.slice(5);
    const url = "https://fred.stlouisfed.org/graph/fredgraph.csv?id=" + encodeURIComponent(serie);
    const r = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
    const texte = await r.text();
    const ts = [], cl = [];
    for (const ligne of texte.split("\n").slice(1)) {
      const parties = ligne.trim().split(",");
      if (parties.length < 2 || !parties[0] || parties[1] === ".") continue;
      const t = Date.parse(parties[0] + "T00:00:00Z");
      const v = parseFloat(parties[1]);
      if (!isNaN(t) && !isNaN(v)) {
        ts.push(Math.floor(t / 1000));
        cl.push(v);
      }
    }
    if (!ts.length) {
      return { statusCode: 404, body: JSON.stringify({ error: "série FRED vide : " + serie }) };
    }
    const debut = Math.max(ts.length - 6, 0);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      body: JSON.stringify({ chart: { result: [{
        meta: { symbol: serie },
        timestamp: ts.slice(debut),
        indicators: { quote: [{ close: cl.slice(debut) }] }
      }] } })
    };
  }

  /* ===== CAS 2 : Yahoo Finance — inchangé ===== */
  const api = "https://query1.finance.yahoo.com/v8/finance/chart/"
    + encodeURIComponent(ticker) + "?range=5d&interval=1d";
  const r = await fetch(api, { headers: { "User-Agent": "Mozilla/5.0" } });
  const data = await r.json();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(data)
  };
}

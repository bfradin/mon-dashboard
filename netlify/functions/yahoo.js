export async function handler(event) {
  const ticker = (event.queryStringParameters && event.queryStringParameters.ticker) || "";
  if (!ticker) {
    return { statusCode: 400, body: JSON.stringify({ error: "ticker manquant" }) };
  }
  const api = "https://query1.finance.yahoo.com/v8/finance/chart/"
    + encodeURIComponent(ticker) + "?range=5d&interval=1d";
  const r = await fetch(api, { headers: { "User-Agent": "Mozilla/5.0" } });
  const data = await r.json();
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*"
    },
    body: JSON.stringify(data)
  };
}
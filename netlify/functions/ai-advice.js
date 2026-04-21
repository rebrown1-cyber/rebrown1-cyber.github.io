exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const referer = event.headers["referer"] || event.headers["origin"] || "";
  if (!referer.includes("frabjous-pudding-57b8af.netlify.app")) {
    return { statusCode: 403, body: "Forbidden" };
  }

  const { month, pressureInHg, trend, tempF, wind, todayStr } = JSON.parse(event.body);

  const prompt = `You are an expert Northeast US fishing guide. Today is ${todayStr}, month: ${month}.
Current conditions: ${tempF}°F air, ${pressureInHg} inHg pressure (${trend}), wind ${wind} mph.

Give concise actionable advice for BOTH fishing types.

## Freshwater
- Top 3 target species right now in Northeast ponds/lakes with brief reason
- Where fish are likely located (depth, structure, near shore vs deep)
- Best lures/bait and retrieve style for these exact conditions
- Spawn/bedding/seasonal behavior happening this month

## Saltwater
- Species currently running or active in Northeast coastal/inshore waters this month
- Where to find them (beach, inlet, flats, depth)
- Best rigs and lures for current conditions
- Tide phase advice for these species

Keep to 5-7 bullets per section. Be specific to Northeast US. Use markdown bullet lists only.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await res.json();

  if (data.error) {
    return { statusCode: 500, body: JSON.stringify({ error: data.error.message }) };
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ advice: data.content?.[0]?.text ?? "Unable to load advice." })
  };
};

// AI provider hook - uses OpenAI Chat Completions (3.5-turbo JSON mode)
// NOTE: Exposing API keys in a browser is insecure. Prefer a small server proxy.

export function useAIProvider() {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  const MODEL = 'gpt-3.5-turbo-0125'; // 3.5 model that supports JSON mode; fallback below

  async function getFieldSuggestions(payload) {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Set REACT_APP_OPENAI_API_KEY in your .env file');
    }

    // Defensive helpers
    const arr = (v) => Array.isArray(v) ? v : [];
    const safeMap = (xs, fn) => arr(xs).map(fn).filter(Boolean);
    const todayUS = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });

    // Build the "example schema" segment safely (avoid 'undefined' strings)
    const schemaLines = []
      .concat(safeMap(payload?.companyFields, f => `"${f.id}": "string"`))
      .concat(safeMap(payload?.purchaseOrderFields, f => `"${f.id}": "string"`))
      .concat(safeMap(payload?.vendorFields, f => `"${f.id}": "string"`))
      .concat(safeMap(payload?.shipToFields, f => `"${f.id}": "string"`));

    const messages = [
      {
        role: 'system',
        content:
`You are a professional business data generator. Output ONLY valid JSON (no code fences, no prose).
Generate realistic purchase order data for a US company.

Rules:
- Use real US cities and professional formatting.
- Monetary fields MUST have exactly one leading dollar sign, e.g., "$1,234.56".
- Do NOT prefix any amount with more than one "$".
- Return ONLY a single JSON object (no arrays, no extra text).`
      },
              {
          role: 'user',
          content:
`Generate a complete purchase order for a medium enterprise in the general business industry.

Constraints:
- PO date: today (America/Chicago)
- Use real US cities and professional formatting
- 3 line items
- Totals: subtotal, 8.5% tax, shipping in $25–$75 range, "other" (may be "$0.00"), total must add up
- Every money value must have exactly one "$" (e.g., "$1,234.56")

Return ONLY a single JSON object with these exact keys:

{
  ${schemaLines.join(',\n  ')}${schemaLines.length ? ',' : ''}

  "requisitioner": "string",
  "shipVia": "string",
  "fob": "string",
  "shippingTerms": "string",

  "itemNumber1": "string",
  "description1": "string",
  "qty1": "string",
  "rate1": "string",
  "amount1": "string",

  "itemNumber2": "string",
  "description2": "string",
  "qty2": "string",
  "rate2": "string",
  "amount2": "string",

  "itemNumber3": "string",
  "description3": "string",
  "qty3": "string",
  "rate3": "string",
  "amount3": "string",

  "subtotal": "string",   // with $ sign
  "tax": "string",        // with $ sign
  "shipping": "string",   // with $ sign
  "other": "string",      // with $ sign
  "total": "string",      // with $ sign

  "comments": "string",
  "contactInfo": "string"
}`
      }
    ];

    // Single call (JSON mode) + robust parsing
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60_000);

      const body = JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.2,
        // Ask 3.5 to produce a strict JSON object
        response_format: { type: 'json_object' },
        max_tokens: 1500
      });

      let response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body,
        signal: controller.signal
      });

      // Simple model fallback if needed
      if (response.status === 404 || response.status === 400) {
        const bodyFallback = JSON.stringify({
          model: 'gpt-3.5-turbo', // legacy alias, if enabled on your account
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          max_tokens: 1500
        });
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: bodyFallback,
          signal: controller.signal
        });
      }

      clearTimeout(timeout);

      if (!response.ok) {
        let errTxt = '';
        try { errTxt = JSON.stringify(await response.json()); } catch {}
        throw new Error(`OpenAI API error: ${errTxt || response.statusText}`);
      }

      const data = await response.json();
      console.debug('🧪 OpenAI chat data:', data);

      // Extract content safely
      let content = data?.choices?.[0]?.message?.content;
      if (typeof content !== 'string' || !content.trim()) {
        throw new Error('No response content from OpenAI');
      }

      // Strip accidental code fences just in case
      let cleaned = content.trim();
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
      }

      // Verbose logging to inspect raw/cleaned text
      try {
        console.debug('🧪 Raw message.content length:', content.length);
        console.debug('🧪 Cleaned JSON text (first 2000 chars):', cleaned.slice(0, 2000));
      } catch {}

      // Parse JSON; if it fails, try to salvage the first {...} block
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch (e) {
        console.warn('⚠️ JSON.parse failed on cleaned text. Attempting salvage...', e);
        const first = cleaned.indexOf('{');
        const last = cleaned.lastIndexOf('}');
        if (first !== -1 && last > first) {
          parsed = JSON.parse(cleaned.slice(first, last + 1));
        } else {
          throw e;
        }
      }

      // Whitelist to known fields and fuzzy-match by label
      const allFields = [
        ...arr(payload?.companyFields),
        ...arr(payload?.purchaseOrderFields),
        ...arr(payload?.vendorFields),
        ...arr(payload?.shipToFields),
        ...arr(payload?.shippingFields)
      ];

      // Include fixed keys that aren't in React state arrays (line items, totals, comments)
      const fixedExtraIds = [
        // Line items (first 3 rows)
        'itemNumber1','description1','qty1','rate1','amount1',
        'itemNumber2','description2','qty2','rate2','amount2',
        'itemNumber3','description3','qty3','rate3','amount3',
        // Totals
        'subtotal','tax','shipping','other','total',
        // Comments / contact
        'comments','contactInfo'
      ];

      const allowedIds = new Set([
        ...allFields.map(f => f.id),
        ...fixedExtraIds
      ]);
      const normalize = (s) => String(s || '')
        .toLowerCase()
        .replace(/[`"'']/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/[^a-z0-9]+/g, '');

      const labelToId = Object.fromEntries(
        allFields.map(f => [normalize(f.label || f.id), f.id])
      );

      const coerceToString = (v) => {
        if (typeof v === 'string') return v;
        if (typeof v === 'number' || typeof v === 'boolean') return String(v);
        if (v && typeof v === 'object') {
          if (typeof v.value === 'string') return v.value;
          if (typeof v.text === 'string') return v.text;
        }
        return undefined;
      };

      const suggestions = {};
      for (const [rawKey, rawVal] of Object.entries(parsed || {})) {
        const value = coerceToString(rawVal);
        if (value === undefined) continue;

        if (allowedIds.has(rawKey)) {
          suggestions[rawKey] = value;
          continue;
        }
        const maybeId = labelToId[normalize(rawKey)];
        if (maybeId && allowedIds.has(maybeId)) {
          suggestions[maybeId] = value;
        }
      }
      try {
        console.debug('🧪 Parsed keys from model:', Object.keys(parsed || {}));
        console.debug('🧪 Suggestions keys (whitelisted to known IDs):', Object.keys(suggestions));
        console.debug('🧪 Suggestions preview (first 2000 chars):', JSON.stringify(suggestions, null, 2).slice(0, 2000));
      } catch {}

      return { suggestions };
    } catch (error) {
      console.error('OpenAI API call failed:', error);
      throw error;
    }
  }

  return { getFieldSuggestions };
}



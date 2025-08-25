const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// AI endpoint for field suggestions (legacy)
app.post('/api/ai/fill', async (req, res) => {
  try {
    const { payload } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    // Build the messages array (same logic as your frontend)
    const arr = (v) => Array.isArray(v) ? v : [];
    const safeMap = (xs, fn) => arr(xs).map(fn).filter(Boolean);
    const todayUS = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' });

    const schemaLines = []
      .concat(safeMap(payload?.companyFields, f => `"${f.id}": "string"`))
      .concat(safeMap(payload?.purchaseOrderFields, f => `"${f.id}": "string"`))
      .concat(safeMap(payload?.vendorFields, f => `"${f.id}": "string"`))
      .concat(safeMap(payload?.shipToFields, f => `"${f.id}": "string"`));

    const messages = [
      {
        role: 'system',
        content: `You are a professional business data generator. Output ONLY valid JSON (no code fences, no prose).
Generate realistic purchase order data for a US company.

Rules:
- Use real US cities and professional formatting.
- Monetary fields MUST have exactly one leading dollar sign, e.g., "$1,234.56".
- Do NOT prefix any amount with more than one "$".
- Return ONLY a single JSON object (no arrays, no extra text).`
      },
      {
        role: 'user',
        content: `Generate a complete purchase order for a medium enterprise in the general business industry.

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

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Updated to current model
        messages,
        temperature: 0.2,
        response_format: { type: 'json_object' },
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      return res.status(response.status).json({ 
        error: `OpenAI API error: ${response.status} - ${errorText}` 
      });
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    
    if (!content) {
      return res.status(500).json({ error: 'No response content from OpenAI' });
    }

    // Parse and clean the JSON response
    let cleaned = content.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```$/i, '').trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      // Try to salvage the first {...} block
      const first = cleaned.indexOf('{');
      const last = cleaned.lastIndexOf('}');
      if (first !== -1 && last > first) {
        parsed = JSON.parse(cleaned.slice(first, last + 1));
      } else {
        throw e;
      }
    }

    // Process suggestions (same logic as your frontend)
    const allFields = [
      ...arr(payload?.companyFields),
      ...arr(payload?.purchaseOrderFields),
      ...arr(payload?.vendorFields),
      ...arr(payload?.shipToFields),
      ...arr(payload?.shippingFields)
    ];

    const fixedExtraIds = [
      'itemNumber1','description1','qty1','rate1','amount1',
      'itemNumber2','description2','qty2','rate2','amount2',
      'itemNumber3','description3','qty3','rate3','amount3',
      'subtotal','tax','shipping','other','total',
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

    res.json({ suggestions });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message });
  }
});

// AI endpoint for analyze (matches frontend expectations)
app.post('/api/analyze', async (req, res) => {
  try {
    const { messages, model = 'gpt-4o-mini' } = req.body;
    
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.1,
        response_format: { type: 'json_object' },
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({ error });
    }

    const data = await response.json();
    return res.status(200).json(data);

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files from React build (for production)
app.use(express.static(path.join(__dirname, '../build')));

// Catch-all handler for React routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 AI fill endpoint: http://localhost:${PORT}/api/ai/fill`);
  console.log(`🔍 AI analyze endpoint: http://localhost:${PORT}/api/analyze`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

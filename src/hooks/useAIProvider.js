// AI provider hook - works directly in the browser
// Create a .env file in your project root with: REACT_APP_OPENAI_API_KEY=your-api-key-here

export function useAIProvider() {
  async function getFieldSuggestions(payload) {
    try {
      // No need for API key - handled by serverless function

      // Build the messages array
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

      // Call our serverless function instead of OpenAI directly
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          max_tokens: 1500
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API call failed: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Clean and parse the response
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
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

      // Process suggestions
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

      return { suggestions };
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }

  async function analyzeFile(fileContent) {
    console.log('🔍 analyzeFile called with content:', fileContent?.substring(0, 100));
    try {
      // No need for API key - handled by serverless function

      const analysisPrompt = `Analyze this purchase order document and extract the following information:

1. **Section Colors**: Identify the colors used for section headers/titles
2. **Field Structure**: Identify all the fields present in each section

Document Content:
${fileContent}

Please return a JSON object with this structure:
{
  "colors": {
    "section1": "#hexcolor or color name",
    "section2": "#hexcolor or color name",
    "section3": "#hexcolor or color name",
    "section4": "#hexcolor or color name"
  },
  "fields": {
    "company": [
      {"id": "company-name", "label": "Company Name:", "placeholder": "Enter company name", "value": ""}
    ],
    "purchaseOrder": [
      {"id": "po-title", "label": "Purchase Order", "placeholder": "", "value": "Purchase Order", "isTitle": true}
    ],
    "vendor": [
      {"id": "vendor-company", "label": "Company:", "placeholder": "Vendor name", "value": ""}
    ],
    "shipTo": [
      {"id": "ship-to-name", "label": "Name:", "placeholder": "Contact name", "value": ""}
    ]
  }
}

Focus on identifying:
- Company information fields
- Purchase order details
- Vendor information
- Shipping/recipient details
- Any custom fields that might be present

Return ONLY valid JSON, no additional text.`;

      // Call our serverless function instead of OpenAI directly
      console.log('📡 Making API call via serverless function...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing purchase order documents. Extract field structures and colors accurately.'
            },
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.1,
          response_format: { type: 'json_object' },
          max_tokens: 2000
        })
      });

      console.log('📡 API Response status:', response.status);
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ OpenAI API error:', errorData);
        throw new Error(`OpenAI API call failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from OpenAI');
      }

      // Parse the JSON response
      let parsedResult;
      try {
        parsedResult = JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse GPT response:', parseError);
        throw new Error('Failed to parse analysis result');
      }

      return parsedResult;
    } catch (error) {
      console.error('File analysis failed:', error);
      throw error;
    }
  }

  return { getFieldSuggestions, analyzeFile };
}



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

      // Call API - use Vercel function in production, local server in development
      const apiUrl = '/api/analyze';
      
      const response = await fetch(apiUrl, {
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

      const analysisPrompt = `PHASE 1: Parse and label the document data

Document Content:
${fileContent}

INSTRUCTIONS FOR PHASE 1:
1. First, extract ALL information from the document and organize it into label-value pairs
2. Look for every piece of data: company info, purchase order details, vendor info, shipping details, line items, totals, comments
3. For each piece of data, identify what it is (the label) and what the actual value is
4. Extract colors used in different sections if visible

PHASE 2: Map to available form fields

AVAILABLE FORM FIELDS:

Company Section:
- company-name: Company Name
- company-address: Street Address
- company-city-state: City, ST ZIP
- company-phone: Phone
- company-fax: Fax
- company-website: Website

Purchase Order Section:
- po-title: Purchase Order (title)
- po-date: DATE (look for dates like 16-07-2024, 07/16/2024, etc.)
- po-number: PO # (look for PO numbers, might be in brackets like [123456])

Vendor Section:
- vendor-company: Vendor Company Name
- vendor-contact: Contact Person
- vendor-address: Vendor Street Address
- vendor-city-state: Vendor City, ST ZIP
- vendor-phone: Vendor Phone
- vendor-fax: Vendor Fax

Ship To Section:
- ship-to-name: Ship To Name/Contact
- ship-to-company: Ship To Company
- ship-to-address: Ship To Address
- ship-to-city-state: Ship To City, ST ZIP
- ship-to-phone: Ship To Phone

Shipping Info:
- requisitioner: Requisitioner
- ship-via: Ship Via
- fob: F.O.B.
- shipping-terms: Shipping Terms

Line Items (extract all items you find):
- For each item, extract: itemNumber, description, qty, rate/unitPrice, amount/total

Totals:
- subtotal: Subtotal amount
- tax: Tax amount
- shipping: Shipping amount
- other: Other charges
- total: Total amount

Comments:
- comments: Any comments or special instructions

INSTRUCTIONS:
1. Extract EVERY piece of data you can find from the document
2. Match data to the CLOSEST appropriate field ID from the list above
3. Use fuzzy matching - if something looks like a company name at the top, it's probably company-name
4. If you see "GimBooks" anywhere, that's likely the company name
5. Dates can be in various formats (MM/DD/YYYY, DD-MM-YYYY, etc.)
6. PO numbers might be in brackets [123456] - extract just the number
7. For line items, extract ALL items you find (Product XYZ, Product ABC, etc.)
8. Extract all monetary values with or without $ signs
9. If a field appears empty or has placeholder text like [Company Name], leave it empty

Return a JSON object with this structure:
{
  "colors": {
    "section1": "color found or 'default'",
    "section2": "color found or 'default'",
    "section3": "color found or 'default'",
    "section4": "color found or 'default'"
  },
  "fields": {
    "company": [
      {"id": "company-name", "label": "Company Name:", "value": "extracted value or empty"},
      {"id": "company-address", "label": "Street Address:", "value": "extracted value or empty"},
      {"id": "company-city-state", "label": "City, ST ZIP:", "value": "extracted value or empty"},
      {"id": "company-phone", "label": "Phone:", "value": "extracted value or empty"},
      {"id": "company-fax", "label": "Fax:", "value": "extracted value or empty"},
      {"id": "company-website", "label": "Website:", "value": "extracted value or empty"}
    ],
    "purchaseOrder": [
      {"id": "po-title", "label": "Purchase Order", "value": "PURCHASE ORDER or similar"},
      {"id": "po-date", "label": "DATE:", "value": "extracted date"},
      {"id": "po-number", "label": "PO #:", "value": "extracted PO number"}
    ],
    "vendor": [
      {"id": "vendor-company", "label": "Company:", "value": "extracted or empty"},
      {"id": "vendor-contact", "label": "Contact:", "value": "extracted or empty"},
      {"id": "vendor-address", "label": "Address:", "value": "extracted or empty"},
      {"id": "vendor-city-state", "label": "City/State:", "value": "extracted or empty"},
      {"id": "vendor-phone", "label": "Phone:", "value": "extracted or empty"}
    ],
    "shipTo": [
      {"id": "ship-to-name", "label": "Name:", "value": "extracted or empty"},
      {"id": "ship-to-company", "label": "Company:", "value": "extracted or empty"},
      {"id": "ship-to-address", "label": "Address:", "value": "extracted or empty"},
      {"id": "ship-to-city-state", "label": "City/State:", "value": "extracted or empty"},
      {"id": "ship-to-phone", "label": "Phone:", "value": "extracted or empty"}
    ],
    "shipping": [
      {"id": "requisitioner", "label": "Requisitioner:", "value": "extracted or empty"},
      {"id": "ship-via", "label": "Ship Via:", "value": "extracted or empty"},
      {"id": "fob", "label": "F.O.B.:", "value": "extracted or empty"},
      {"id": "shipping-terms", "label": "Shipping Terms:", "value": "extracted or empty"}
    ],
    "items": [
      {"id": "item1", "itemNumber": "extract", "description": "extract", "qty": "extract", "unitPrice": "extract", "total": "extract"}
    ],
    "totals": [
      {"id": "subtotal", "label": "SUBTOTAL", "value": "extract"},
      {"id": "tax", "label": "TAX", "value": "extract"},
      {"id": "shipping", "label": "SHIPPING", "value": "extract"},
      {"id": "other", "label": "OTHER", "value": "extract"},
      {"id": "total", "label": "TOTAL", "value": "extract"}
    ],
    "comments": [
      {"id": "comments", "label": "Comments:", "value": "extract any comments"}
    ]
  }
}

REMEMBER: Extract EVERYTHING you can find and match it to the most appropriate field!

Return ONLY valid JSON, no additional text.`;

      // Call API - use Vercel function in production, local server in development
      const apiUrl = '/api/analyze';
      
      console.log('📡 Making API call to:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing purchase order documents. Extract field structures and colors accurately. CRITICAL: Extract ACTUAL VALUES, not field labels. If you see "Company Name:" as a label, extract "GimBooks" (the actual company name). If you see "Phone:" as a label, extract "(000) 000-0000" (the actual phone number). Field labels are NOT the values.'
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

      console.log('🔍 Raw GPT response content:', content);

      // Parse the JSON response
      let parsedResult;
      try {
        parsedResult = JSON.parse(content);
        console.log('🔍 Parsed GPT response:', parsedResult);
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

// Export analyzeFile as a standalone function for direct import
export async function analyzeFile(fileContent) {
  console.log('🔍 analyzeFile called with content:', fileContent?.substring(0, 100));
  try {
    // No need for API key - handled by serverless function

    const analysisPrompt = `Analyze this purchase order document and extract ALL information you can find.

Document Content:
${fileContent}

AVAILABLE FIELDS TO POPULATE:

Company Section:
- company-name: Company Name
- company-address: Street Address
- company-city-state: City, ST ZIP
- company-phone: Phone
- company-fax: Fax
- company-website: Website

Purchase Order Section:
- po-title: Purchase Order (title)
- po-date: DATE (look for dates like 16-07-2024, 07/16/2024, etc.)
- po-number: PO # (look for PO numbers, might be in brackets like [123456])

Vendor Section:
- vendor-company: Vendor Company Name
- vendor-contact: Contact Person
- vendor-address: Vendor Street Address
- vendor-city-state: Vendor City, ST ZIP
- vendor-phone: Vendor Phone
- vendor-fax: Vendor Fax

Ship To Section:
- ship-to-name: Ship To Name/Contact
- ship-to-company: Ship To Company
- ship-to-address: Ship To Address
- ship-to-city-state: Ship To City, ST ZIP
- ship-to-phone: Ship To Phone

Shipping Info:
- requisitioner: Requisitioner
- ship-via: Ship Via
- fob: F.O.B.
- shipping-terms: Shipping Terms

Line Items (extract all items you find):
- For each item, extract: itemNumber, description, qty, rate/unitPrice, amount/total

Totals:
- subtotal: Subtotal amount
- tax: Tax amount
- shipping: Shipping amount
- other: Other charges
- total: Total amount

Comments:
- comments: Any comments or special instructions

INSTRUCTIONS:
1. Extract EVERY piece of data you can find from the document
2. Match data to the CLOSEST appropriate field ID from the list above
3. Use fuzzy matching - if something looks like a company name at the top, it's probably company-name
4. If you see "GimBooks" anywhere, that's likely the company name
5. Dates can be in various formats (MM/DD/YYYY, DD-MM-YYYY, etc.)
6. PO numbers might be in brackets [123456] - extract just the number
7. For line items, extract ALL items you find (Product XYZ, Product ABC, etc.)
8. Extract all monetary values with or without $ signs
9. If a field appears empty or has placeholder text like [Company Name], leave it empty

Return a JSON object with this structure:
{
  "colors": {
    "section1": "color found or 'default'",
    "section2": "color found or 'default'",
    "section3": "color found or 'default'",
    "section4": "color found or 'default'"
  },
  "fields": {
    "company": [
      {"id": "company-name", "label": "Company Name:", "value": "extracted value or empty"},
      {"id": "company-address", "label": "Street Address:", "value": "extracted value or empty"},
      {"id": "company-city-state", "label": "City, ST ZIP:", "value": "extracted value or empty"},
      {"id": "company-phone", "label": "Phone:", "value": "extracted value or empty"},
      {"id": "company-fax", "label": "Fax:", "value": "extracted value or empty"},
      {"id": "company-website", "label": "Website:", "value": "extracted value or empty"}
    ],
    "purchaseOrder": [
      {"id": "po-title", "label": "Purchase Order", "value": "PURCHASE ORDER or similar"},
      {"id": "po-date", "label": "DATE:", "value": "extracted date"},
      {"id": "po-number", "label": "PO #:", "value": "extracted PO number"}
    ],
    "vendor": [
      {"id": "vendor-company", "label": "Company:", "value": "extracted or empty"},
      {"id": "vendor-contact", "label": "Contact:", "value": "extracted or empty"},
      {"id": "vendor-address", "label": "Address:", "value": "extracted or empty"},
      {"id": "vendor-city-state", "label": "City/State:", "value": "extracted or empty"},
      {"id": "vendor-phone", "label": "Phone:", "value": "extracted or empty"}
    ],
    "shipTo": [
      {"id": "ship-to-name", "label": "Name:", "value": "extracted or empty"},
      {"id": "ship-to-company", "label": "Company:", "value": "extracted or empty"},
      {"id": "ship-to-address", "label": "Address:", "value": "extracted or empty"},
      {"id": "ship-to-city-state", "label": "City/State:", "value": "extracted or empty"},
      {"id": "ship-to-phone", "label": "Phone:", "value": "extracted or empty"}
    ],
    "shipping": [
      {"id": "requisitioner", "label": "Requisitioner:", "value": "extracted or empty"},
      {"id": "ship-via", "label": "Ship Via:", "value": "extracted or empty"},
      {"id": "fob", "label": "F.O.B.:", "value": "extracted or empty"},
      {"id": "shipping-terms", "label": "Shipping Terms:", "value": "extracted or empty"}
    ],
    "items": [
      {"id": "item1", "itemNumber": "extract", "description": "extract", "qty": "extract", "unitPrice": "extract", "total": "extract"}
    ],
    "totals": [
      {"id": "subtotal", "label": "SUBTOTAL", "value": "extract"},
      {"id": "tax", "label": "TAX", "value": "extract"},
      {"id": "shipping", "label": "SHIPPING", "value": "extract"},
      {"id": "other", "label": "OTHER", "value": "extract"},
      {"id": "total", "label": "TOTAL", "value": "extract"}
    ],
    "comments": [
      {"id": "comments", "label": "Comments:", "value": "extract any comments"}
    ]
  }
}

REMEMBER: Extract EVERYTHING you can find and match it to the most appropriate field!

Return ONLY valid JSON, no additional text.`;

    // Call API - use Vercel function in production, local server in development
    const apiUrl = '/api/analyze';
    
    console.log('📡 Making API call to:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing purchase order documents. Extract field structures and colors accurately. CRITICAL: Extract ACTUAL VALUES, not field labels. If you see "Company Name:" as a label, extract "GimBooks" (the actual company name). If you see "Phone:" as a label, extract "(000) 000-0000" (the actual phone number). Field labels are NOT the values.'
          },
          {
            role: 'user',
            content: analysisPrompt
          },
          {
            role: 'system',
            content: 'COLOR DETECTION: When analyzing the document, look for any visual colors in each section. Detect whatever colors you actually see - could be green, blue, red, purple, orange, brown, gray, black, or any other colors. Use the actual color names you observe. Only use "default" if you cannot detect any specific color. Be accurate about what colors you actually see in the document.'
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

    console.log('🔍 Raw GPT response content:', content);

    // Parse the JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(content);
      console.log('🔍 Parsed GPT response:', parsedResult);
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



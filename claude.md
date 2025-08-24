Cursor Prompt for Purchase Order XML Generation
Main Prompt:
Convert this React form data into NetSuite-compatible XML format for a Purchase Order PDF template with these STRICT requirements:

STRUCTURE:
1. Start with: <?xml version="1.0"?><!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
2. Use <pdf> or <pdfset> as the root element (NOT <html>)
3. Include <head> and <body> tags
4. Place all styles in <head> element
5. Use ONLY <table> elements for layout - NO <div> tags allowed

LAYOUT REQUIREMENTS:
- Create a green-bordered purchase order matching the provided design
- Header section with company logo and "PURCHASE ORDER" title
- Two-column layout for Vendor and Ship To sections
- Full-width table for line items with columns: Item #, Description, QTY, Unit Price, Total
- Footer section with subtotals and comments
- All text fields should be dynamically populated from form data

STYLING:
- Green color scheme (#00b050 for headers)
- Border around entire document
- Table-based layout for all sections
- Professional spacing and alignment

DYNAMIC DATA:
Map these form fields to XML:
- Company info (name, address, phone, fax, website)
- PO number and date
- Vendor details
- Ship to details
- Line items array with calculations
- Subtotal, tax, shipping, and total amounts
- Comments/special instructions

OUTPUT FORMAT:
Generate complete XML that renders exactly like the attached purchase order image using only table-based layouts. Include inline styles or style blocks in the head section. Ensure all dynamic fields are properly mapped using ${formData.fieldName} or appropriate NetSuite syntax.
Additional Context to Provide:
The form has these data fields available:
- formData.companyName
- formData.companyAddress
- formData.companyCity
- formData.companyPhone
- formData.companyFax
- formData.companyWebsite
- formData.poNumber
- formData.poDate
- formData.vendorName
- formData.vendorContact
- formData.vendorAddress
- formData.vendorCity
- formData.vendorPhone
- formData.vendorFax
- formData.shipToName
- formData.shipToCompany
- formData.shipToAddress
- formData.shipToCity
- formData.shipToPhone
- formData.requisitioner
- formData.shipVia
- formData.fob
- formData.shippingTerms
- formData.lineItems[] (array with: itemNumber, description, quantity, unitPrice, total)
- formData.subtotal
- formData.tax
- formData.shipping
- formData.other
- formData.total
- formData.comments
Example Structure to Follow:
xml<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <style type="text/css">
        table { width: 100%; border-collapse: collapse; }
        .header-table { border: 2px solid #00b050; }
        .green-bg { background-color: #00b050; color: white; }
        /* Add more styles here */
    </style>
</head>
<body>
    <table class="main-container">
        <tr>
            <td>
                <!-- Header Table -->
                <table class="header-table">
                    <!-- Company info and PO details -->
                </table>
            </td>
        </tr>
        <tr>
            <td>
                <!-- Vendor and Ship To Table -->
                <table>
                    <tr>
                        <td width="50%"><!-- Vendor info --></td>
                        <td width="50%"><!-- Ship to info --></td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- Continue with line items table, totals, etc. -->
    </table>
</body>
</pdf>
Key Points to Emphasize:

NO DIV TAGS - Everything must be table-based
NetSuite PDF format - Not HTML format
Exact visual match - The XML should render exactly like the purchase order image
All dynamic data - Every field should pull from the React form data
Proper calculations - Line item totals and grand total should calculate correctly
Green theme - Match the green color scheme from the original
Professional formatting - Proper spacing, borders, and alignment

Testing Instructions:
After generating the XML, verify:

All form fields map correctly to XML placeholders
Table structure maintains the layout without divs
Styles are properly placed in the head section
The root element is <pdf> or <pdfset>, not <html>
The DOCTYPE declaration is correct for NetSuite
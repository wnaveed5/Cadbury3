// Available fields data for the purchase order form
export const availableFieldsData = [
  // Company Information Fields
  { category: 'Company Information', fields: [
    'Tax ID Number',
    'DUNS Number',
    'Business License',
    'Industry Classification',
    'Year Established',
    'Employee Count',
    'Annual Revenue',
    'Parent Company',
    'Subsidiaries',
    'Business Type (LLC, Corp, etc.)'
  ]},
  // Purchase Order Fields
  { category: 'Purchase Order Details', fields: [
    'Delivery Date',
    'Payment Terms',
    'Currency',
    'Purchase Order Type',
    'Priority Level',
    'Department',
    'Project Code',
    'Cost Center',
    'Approval Status',
    'Approved By'
  ]},
  // Vendor Fields
  { category: 'Vendor Information', fields: [
    'Vendor Tax ID',
    'Vendor DUNS',
    'Vendor Rating',
    'Payment History',
    'Contract Terms',
    'Insurance Certificate',
    'Bond Information',
    'Quality Rating',
    'Delivery Performance',
    'Warranty Terms'
  ]},
  // Shipping Fields
  { category: 'Shipping & Delivery', fields: [
    'Expected Delivery',
    'Carrier Information',
    'Tracking Number',
    'Delivery Instructions',
    'Special Handling',
    'Packaging Requirements',
    'Delivery Confirmation',
    'Return Policy',
    'Damage Claims',
    'Freight Class'
  ]},
  // Financial Fields
  { category: 'Financial Details', fields: [
    'Discount Percentage',
    'Early Payment Discount',
    'Late Payment Penalty',
    'Installment Terms',
    'Security Deposit',
    'Performance Bond',
    'Liquidated Damages',
    'Retention Amount',
    'Change Order Process',
    'Budget Approval'
  ]},
  // Compliance Fields
  { category: 'Compliance & Legal', fields: [
    'Regulatory Compliance',
    'Safety Requirements',
    'Environmental Standards',
    'Quality Certifications',
    'Audit Requirements',
    'Documentation Standards',
    'Record Retention',
    'Confidentiality Terms',
    'Non-Compete Clauses',
    'Dispute Resolution'
  ]}
];

export default availableFieldsData;

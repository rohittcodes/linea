import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Invoice, Client, LineItem, User, Template } from '@prisma/client';
import type { Invoice as PrismaInvoice } from '@prisma/client';
import { generateTemplate1PDF } from './pdf/templates/Template1';
import { generateTemplate2PDF } from './pdf/templates/Template2';
import { generateTemplate3PDF } from './pdf/templates/Template3';
import { generateTemplate4PDF } from './pdf/templates/Template4';
import { generateTemplate5PDF } from './pdf/templates/Template5';
import { generateTemplate6PDF } from './pdf/templates/Template6';
import { pdfTheme as theme, tw } from './pdf/theme';
import { prisma } from './db';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    borderBottom: '2 solid #000000',
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  invoiceNumber: {
    fontSize: 18,
    color: '#000000',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    color: '#000000',
    padding: '4 8',
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000000',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 12,
    color: '#000000',
    width: 100,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 12,
    color: '#000000',
    flex: 1,
  },
  companyInfo: {
    marginBottom: 20,
  },
  clientInfo: {
    marginBottom: 20,
  },
  itemsTable: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    padding: 10,
    borderBottom: '1 solid #000000',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1 solid #cccccc',
  },
  description: {
    flex: 3,
    fontSize: 12,
    color: '#000000',
  },
  quantity: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
    color: '#000000',
  },
  rate: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    color: '#000000',
  },
  amount: {
    flex: 1,
    fontSize: 12,
    textAlign: 'right',
    color: '#000000',
  },
  totals: {
    marginTop: 30,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 14,
    width: 100,
    textAlign: 'right',
    marginRight: 10,
  },
  totalValue: {
    fontSize: 14,
    width: 80,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: '1 solid #000000',
    fontSize: 10,
    color: '#000000',
    textAlign: 'center',
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
  terms: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
  },
});

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  lineItems: LineItem[];
  user: User;
  template?: Template | null;
}

// Helper to check if templateId is a UUID (custom template)
function isUUID(str: string | null | undefined): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

// Generate PDF using custom template configuration
function generateCustomTemplatePDF(invoice: InvoiceWithDetails, template: Template) {
  const design = template.design as any;
  const branding = template.branding as any;
  const layout = template.layout || 'standard';

  const primaryColor = design?.primaryColor || '#2388ff';
  const secondaryColor = design?.secondaryColor || '#f8fafc';
  const fontFamily = design?.fontFamily || 'Helvetica';
  const fontSize = parseInt(design?.fontSize || '14px') || 14;

  // Company info from branding or fallback to user
  const companyName = branding?.companyName || invoice.user.companyName || 'Your Company';
  const companyAddress = branding?.companyAddress || invoice.user.companyAddress;
  const companyEmail = branding?.companyEmail || invoice.user.companyEmail;
  const companyPhone = branding?.companyPhone || invoice.user.companyPhone;

  const fmt = (n: any) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: (invoice as any).currency || 'USD'
  }).format(Number(n || 0));

  const dateStr = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : '');

  // Dynamic styles based on template config
  const dynamicStyles = StyleSheet.create({
    page: {
      padding: 36,
      fontSize: fontSize,
      fontFamily: fontFamily,
      color: '#111827',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 24,
      paddingBottom: 16,
      borderBottomWidth: 2,
      borderBottomColor: primaryColor,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: primaryColor,
    },
    invoiceNumber: {
      fontSize: 14,
      color: '#6b7280',
      marginTop: 4,
    },
    statusBadge: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      backgroundColor: secondaryColor,
      fontSize: 11,
      fontWeight: 'bold',
      color: primaryColor,
      textTransform: 'uppercase',
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 11,
      color: '#6b7280',
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    companyInfo: {
      marginBottom: 16,
    },
    companyName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 4,
    },
    companyDetail: {
      fontSize: fontSize,
      color: '#374151',
      marginBottom: 2,
    },
    clientInfo: {
      marginBottom: 16,
    },
    clientName: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: 4,
    },
    table: {
      width: '100%',
      borderTopWidth: 1,
      borderColor: '#e5e7eb',
      marginTop: 24,
    },
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      backgroundColor: secondaryColor,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
    },
    totalsBox: {
      width: 250,
      alignSelf: 'flex-end',
      marginTop: 24,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 6,
      fontSize: fontSize,
    },
    grandTotal: {
      borderTopWidth: 2,
      borderTopColor: primaryColor,
      paddingTop: 8,
      marginTop: 8,
      fontWeight: 'bold',
      fontSize: fontSize + 2,
    },
    notes: {
      marginTop: 24,
      padding: 16,
      backgroundColor: secondaryColor,
      borderRadius: 8,
    },
  });

  return (
    <Document>
      <Page size="A4" style={dynamicStyles.page}>
        {/* Header */}
        <View style={dynamicStyles.header}>
          <View>
            <Text style={dynamicStyles.headerTitle}>INVOICE</Text>
            <Text style={dynamicStyles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
          <View style={dynamicStyles.statusBadge}>
            <Text>{String(invoice.status || '').toUpperCase()}</Text>
          </View>
        </View>

        {/* Company and Client Info */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 }}>
          <View style={{ width: '48%' }}>
            <Text style={dynamicStyles.sectionTitle}>From</Text>
            <View style={dynamicStyles.companyInfo}>
              <Text style={dynamicStyles.companyName}>{companyName}</Text>
              {companyAddress && <Text style={dynamicStyles.companyDetail}>{companyAddress}</Text>}
              {companyEmail && <Text style={dynamicStyles.companyDetail}>{companyEmail}</Text>}
              {companyPhone && <Text style={dynamicStyles.companyDetail}>{companyPhone}</Text>}
            </View>
          </View>
          <View style={{ width: '48%' }}>
            <Text style={dynamicStyles.sectionTitle}>Bill To</Text>
            <View style={dynamicStyles.clientInfo}>
              <Text style={dynamicStyles.clientName}>{invoice.client.name}</Text>
              {invoice.client.address && <Text style={dynamicStyles.companyDetail}>{invoice.client.address}</Text>}
              {invoice.client.email && <Text style={dynamicStyles.companyDetail}>{invoice.client.email}</Text>}
            </View>
            <View style={{ marginTop: 16 }}>
              <Text style={dynamicStyles.sectionTitle}>Date</Text>
              <Text style={dynamicStyles.companyDetail}>{dateStr(invoice.issueDate)}</Text>
              <Text style={[dynamicStyles.sectionTitle, { marginTop: 8 }]}>Due Date</Text>
              <Text style={dynamicStyles.companyDetail}>{dateStr(invoice.dueDate)}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={dynamicStyles.table}>
          <View style={dynamicStyles.tableHeader}>
            <Text style={{ flex: 6, fontSize: fontSize - 2, fontWeight: 'bold', color: '#374151' }}>Description</Text>
            <Text style={{ flex: 2, fontSize: fontSize - 2, fontWeight: 'bold', color: '#374151', textAlign: 'right' }}>Qty</Text>
            <Text style={{ flex: 3, fontSize: fontSize - 2, fontWeight: 'bold', color: '#374151', textAlign: 'right' }}>Rate</Text>
            <Text style={{ flex: 3, fontSize: fontSize - 2, fontWeight: 'bold', color: '#374151', textAlign: 'right' }}>Amount</Text>
          </View>
          {invoice.lineItems.map((item, idx) => (
            <View key={String(idx)} style={dynamicStyles.tableRow}>
              <Text style={{ flex: 6, fontSize: fontSize }}>{item.description}</Text>
              <Text style={{ flex: 2, fontSize: fontSize, textAlign: 'right' }}>{Number(item.quantity)}</Text>
              <Text style={{ flex: 3, fontSize: fontSize, textAlign: 'right' }}>{fmt(item.unitPrice)}</Text>
              <Text style={{ flex: 3, fontSize: fontSize, textAlign: 'right' }}>{fmt(item.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={dynamicStyles.totalsBox}>
          <View style={dynamicStyles.totalRow}>
            <Text>Subtotal</Text>
            <Text>{fmt(invoice.subtotal)}</Text>
          </View>
          {Number(invoice.taxAmount) > 0 && (
            <View style={dynamicStyles.totalRow}>
              <Text>Tax</Text>
              <Text>{fmt(invoice.taxAmount)}</Text>
            </View>
          )}
          {Number(invoice.discountAmount) > 0 && (
            <View style={dynamicStyles.totalRow}>
              <Text>Discount</Text>
              <Text>-{fmt(invoice.discountAmount)}</Text>
            </View>
          )}
          <View style={[dynamicStyles.totalRow, dynamicStyles.grandTotal]}>
            <Text>Total</Text>
            <Text style={{ color: primaryColor }}>{fmt(invoice.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={dynamicStyles.notes}>
            <Text style={{ fontWeight: 'bold', marginBottom: 8, fontSize: fontSize }}>Notes:</Text>
            <Text style={{ fontSize: fontSize }}>{invoice.notes}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

export function generateInvoicePDF(invoice: InvoiceWithDetails) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#10b981';
      case 'sent':
        return '#3b82f6';
      case 'overdue':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.status}>{invoice.status.toUpperCase()}</Text>
            <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
          </View>
        </View>

        {/* Company and Client Information */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.companyInfo}>
              <Text style={styles.sectionTitle}>From:</Text>
              <Text style={styles.value}>{invoice.user.companyName || 'Your Company'}</Text>
              {invoice.user.companyAddress && (
                <Text style={styles.value}>{invoice.user.companyAddress}</Text>
              )}
              {invoice.user.companyEmail && (
                <Text style={styles.value}>{invoice.user.companyEmail}</Text>
              )}
              {invoice.user.companyPhone && (
                <Text style={styles.value}>{invoice.user.companyPhone}</Text>
              )}
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.sectionTitle}>Bill To:</Text>
              <Text style={styles.value}>{invoice.client.name}</Text>
              {invoice.client.address && (
                <Text style={styles.value}>{invoice.client.address}</Text>
              )}
              <Text style={styles.value}>{invoice.client.email}</Text>
              {invoice.client.phone && (
                <Text style={styles.value}>{invoice.client.phone}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Invoice Details */}
        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>Issue Date:</Text>
            <Text style={styles.value}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Due Date:</Text>
            <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
          </View>
          {invoice.description && (
            <View style={styles.row}>
              <Text style={styles.label}>Description:</Text>
              <Text style={styles.value}>{invoice.description}</Text>
            </View>
          )}
        </View>

        {/* Items Table */}
        <View style={styles.itemsTable}>
          <View style={styles.tableHeader}>
            <Text style={styles.description}>Description</Text>
            <Text style={styles.quantity}>Qty</Text>
            <Text style={styles.rate}>Rate</Text>
            <Text style={styles.amount}>Amount</Text>
          </View>
          
          {invoice.lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.description}>
                {item.description}
                {item.notes && `\n${item.notes}`}
              </Text>
              <Text style={styles.quantity}>{Number(item.quantity)}</Text>
              <Text style={styles.rate}>{formatCurrency(Number(item.unitPrice))}</Text>
              <Text style={styles.amount}>{formatCurrency(Number(item.amount))}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(Number(invoice.subtotal))}</Text>
          </View>
          {Number(invoice.taxAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalValue}>{formatCurrency(Number(invoice.taxAmount))}</Text>
            </View>
          )}
          {Number(invoice.discountAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>-{formatCurrency(Number(invoice.discountAmount))}</Text>
            </View>
          )}
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>{formatCurrency(Number(invoice.total))}</Text>
          </View>
        </View>

        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={styles.value}>{invoice.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {invoice.terms && (
          <View style={styles.terms}>
            <Text style={styles.sectionTitle}>Terms & Conditions:</Text>
            <Text style={styles.value}>{invoice.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Thank you for your business!</Text>
          <Text>{invoice.user.companyName || 'Your Company'}</Text>
          {invoice.user.companyEmail && (
            <Text>{invoice.user.companyEmail}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

// Template-aware wrapper
export async function generateInvoicePDFByTemplate(invoice: InvoiceWithDetails) {
  const templateId = (invoice as any).templateId || (invoice as any).template?.id;
  
  // If no templateId, use default
  if (!templateId) {
    return generateTemplate1PDF(invoice);
  }

  // Check if it's a UUID (custom template) or string ID (built-in template)
  if (isUUID(templateId)) {
    // Custom template - fetch from DB if not already included
    let template = invoice.template;
    if (!template) {
      template = await prisma.template.findUnique({
        where: { id: templateId }
      });
    }
    
    if (template) {
      return generateCustomTemplatePDF(invoice, template);
    }
    // Fallback to template1 if custom template not found
    console.warn(`Custom template ${templateId} not found, falling back to template1`);
    return generateTemplate1PDF(invoice);
  }

  // Built-in template (template1-6)
  switch (templateId) {
    case 'template1':
      return generateTemplate1PDF(invoice);
    case 'template2':
      return generateTemplate2PDF(invoice);
    case 'template3':
      return generateTemplate3PDF(invoice);
    case 'template4':
      return generateTemplate4PDF(invoice);
    case 'template5':
      return generateTemplate5PDF(invoice);
    case 'template6':
      return generateTemplate6PDF(invoice);
    default:
      return generateTemplate1PDF(invoice);
  }
}

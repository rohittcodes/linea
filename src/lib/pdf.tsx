import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Invoice, Client, LineItem, User } from '@prisma/client';

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

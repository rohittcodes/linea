import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, Client, LineItem, User } from '@prisma/client'
import { pdfTheme as theme, tw } from '../theme'

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  lineItems: LineItem[];
  user: User;
}

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 10, color: theme.text.primary },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  company: { fontSize: 16, fontWeight: 700 },
  companySub: { color: theme.text.muted, marginTop: 2 },
  invBlock: { textAlign: 'right' },
  invLabel: { fontSize: 9, color: theme.text.muted },
  invNum: { fontSize: 14, fontWeight: 700 },
  grid: { flexDirection: 'row', gap: 12, marginTop: 16 },
  toCard: { flex: 1, backgroundColor: tw.gray[50], borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 10 },
  toLabel: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  toValue: { fontSize: 11, fontWeight: 600, marginTop: 4 },
  infoCard: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 10 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  table: { marginTop: 16, borderWidth: 1, borderColor: theme.border, borderRadius: 6, overflow: 'hidden' },
  thRow: { flexDirection: 'row', backgroundColor: theme.tableHeaderBg, paddingVertical: 8 },
  th: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderColor: theme.subtleBorder },
  td: { fontSize: 10, color: theme.text.primary },
  right: { textAlign: 'right' },
  totals: { width: 220, alignSelf: 'flex-end', marginTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
})

export function generateTemplate5PDF(inv: InvoiceWithDetails) {
  const fmt = (n: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: (inv as any).currency || 'USD' }).format(Number(n || 0))
  const dateStr = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.company}>{inv.user?.companyName || 'Your Company'}</Text>
            {!!inv.user?.companyAddress && <Text style={styles.companySub}>{inv.user.companyAddress}</Text>}
          </View>
          <View style={styles.invBlock}>
            <Text style={styles.invLabel}>Invoice Number</Text>
            <Text style={styles.invNum}>#{(inv as any).invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.toCard}>
            <Text style={styles.toLabel}>Billed To</Text>
            <Text style={styles.toValue}>{inv.client?.name || ''}</Text>
            {!!inv.client?.address && <Text>{inv.client.address}</Text>}
            {!!inv.client?.email && <Text>{inv.client.email}</Text>}
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}><Text style={styles.toLabel}>Issue Date</Text><Text>{dateStr(inv.issueDate)}</Text></View>
            <View style={styles.infoRow}><Text style={styles.toLabel}>Due Date</Text><Text>{dateStr(inv.dueDate)}</Text></View>
            <View style={styles.infoRow}><Text style={styles.toLabel}>Status</Text><Text style={{ textTransform: 'uppercase' }}>{inv.status}</Text></View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.thRow}>
            <Text style={[styles.th, { flex: 6, paddingHorizontal: 8 }]}>Item</Text>
            <Text style={[styles.th, styles.right, { flex: 2, paddingHorizontal: 8 }]}>Qty</Text>
            <Text style={[styles.th, styles.right, { flex: 3, paddingHorizontal: 8 }]}>Rate</Text>
            <Text style={[styles.th, styles.right, { flex: 3, paddingHorizontal: 8 }]}>Amount</Text>
          </View>
          {inv.lineItems.map((li, idx) => (
            <View key={String(idx)} style={styles.tr}>
              <Text style={[styles.td, { flex: 6, paddingHorizontal: 8 }]}>{li.description}</Text>
              <Text style={[styles.td, styles.right, { flex: 2, paddingHorizontal: 8 }]}>{Number(li.quantity)}</Text>
              <Text style={[styles.td, styles.right, { flex: 3, paddingHorizontal: 8 }]}>{fmt(li.unitPrice)}</Text>
              <Text style={[styles.td, styles.right, { flex: 3, paddingHorizontal: 8 }]}>{fmt(li.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.row}><Text>Subtotal</Text><Text>{fmt((inv as any).subtotal)}</Text></View>
          <View style={styles.row}><Text>Tax</Text><Text>{fmt((inv as any).taxAmount)}</Text></View>
          <View style={[styles.row, { marginTop: 8 }]}><Text style={{ fontWeight: 700 }}>Total</Text><Text style={{ fontWeight: 700 }}>{fmt(inv.total)}</Text></View>
        </View>
      </Page>
    </Document>
  )
}



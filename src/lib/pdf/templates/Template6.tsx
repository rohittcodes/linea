import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { Invoice, Client, LineItem, User } from '@prisma/client'
import { pdfTheme as theme, tw } from '../theme'

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  lineItems: LineItem[];
  user: User;
}

const styles = StyleSheet.create({
  page: { padding: 0, fontSize: 10, color: theme.text.primary },
  darkHeader: { backgroundColor: tw.gray[900], color: '#fff', paddingHorizontal: 28, paddingVertical: 18, flexDirection: 'row', justifyContent: 'space-between' },
  labelXs: { fontSize: 9, color: tw.gray[400], textTransform: 'uppercase' },
  invNum: { fontSize: 18, fontWeight: 700, color: '#fff' },
  content: { padding: 28 },
  twoCol: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  col: { flex: 1 },
  titleSm: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  valueSm: { fontSize: 11, fontWeight: 600, marginTop: 4 },
  table: { borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: theme.border },
  thRow: { flexDirection: 'row', backgroundColor: theme.tableHeaderBg, paddingVertical: 8 },
  th: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderColor: theme.subtleBorder },
  td: { fontSize: 10, color: theme.text.primary },
  right: { textAlign: 'right' },
  totals: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  totalsCard: { width: 220, borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
})

export function generateTemplate6PDF(inv: InvoiceWithDetails) {
  const fmt = (n: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: (inv as any).currency || 'USD' }).format(Number(n || 0))
  const dateStr = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.darkHeader}>
          <View>
            <Text style={styles.labelXs}>Invoice</Text>
            <Text style={styles.invNum}>#{(inv as any).invoiceNumber}</Text>
          </View>
          <View>
            <Text style={styles.labelXs}>Issue</Text>
            <Text style={{ color: '#fff' }}>{dateStr(inv.issueDate)}</Text>
            <Text style={[styles.labelXs, { marginTop: 6 }]}>Due</Text>
            <Text style={{ color: '#fff' }}>{dateStr(inv.dueDate)}</Text>
          </View>
        </View>
        <View style={styles.content}>
          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.titleSm}>From</Text>
              <Text style={styles.valueSm}>{inv.user?.companyName || 'Your Company'}</Text>
              {!!inv.user?.companyAddress && <Text>{inv.user.companyAddress}</Text>}
              {!!inv.user?.companyEmail && <Text>{inv.user.companyEmail}</Text>}
            </View>
            <View style={styles.col}>
              <Text style={styles.titleSm}>Bill To</Text>
              <Text style={styles.valueSm}>{inv.client?.name || ''}</Text>
              {!!inv.client?.address && <Text>{inv.client.address}</Text>}
              {!!inv.client?.email && <Text>{inv.client.email}</Text>}
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.thRow}>
              <Text style={[styles.th, { flex: 6, paddingHorizontal: 8 }]}>Description</Text>
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
            <View style={styles.totalsCard}>
              <View style={styles.row}><Text>Subtotal</Text><Text>{fmt((inv as any).subtotal)}</Text></View>
              <View style={styles.row}><Text>Tax</Text><Text>{fmt((inv as any).taxAmount)}</Text></View>
              <View style={[styles.row, { marginTop: 6 }]}><Text style={{ fontWeight: 700 }}>Total</Text><Text style={{ fontWeight: 700 }}>{fmt(inv.total)}</Text></View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}



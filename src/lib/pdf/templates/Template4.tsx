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
  gradientBar: { height: 80, width: '100%', backgroundColor: tw.violet[600] },
  headerRow: { paddingHorizontal: 28, marginTop: -24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  brand: { fontSize: 20, fontWeight: 800, color: '#fff', textShadow: '0 1px 0 #00000022' as any },
  brandSub: { color: '#ffffffcc', fontSize: 10, marginTop: 2 },
  invBlock: { textAlign: 'right' },
  invLabel: { color: '#ffffffcc', fontSize: 9 },
  invNum: { color: '#fff', fontSize: 14, fontWeight: 700 },
  content: { paddingHorizontal: 28, paddingVertical: 20 },
  grid: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  card: { flex: 1, borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 10 },
  xs: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  md: { fontSize: 12, fontWeight: 600, color: theme.text.primary, marginTop: 4 },
  table: { marginTop: 16, borderWidth: 1, borderColor: theme.border, borderRadius: 6, overflow: 'hidden' },
  thRow: { flexDirection: 'row', backgroundColor: tw.violet[50], paddingVertical: 8 },
  th: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderColor: theme.subtleBorder },
  td: { fontSize: 10, color: theme.text.primary },
  right: { textAlign: 'right' },
  totals: { width: 220, alignSelf: 'flex-end', marginTop: 12, borderWidth: 1, borderColor: theme.border, borderRadius: 6, padding: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
})

export function generateTemplate4PDF(inv: InvoiceWithDetails) {
  const fmt = (n: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: (inv as any).currency || 'USD' }).format(Number(n || 0))
  const dateStr = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.gradientBar} />
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>{inv.user?.companyName || 'Your Company'}</Text>
            {!!inv.user?.companyEmail && <Text style={styles.brandSub}>{inv.user.companyEmail}</Text>}
          </View>
          <View style={styles.invBlock}>
            <Text style={styles.invLabel}>Invoice</Text>
            <Text style={styles.invNum}>#{(inv as any).invoiceNumber}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.xs}>From</Text>
              <Text style={styles.md}>{inv.user?.companyName || ''}</Text>
              {!!inv.user?.companyAddress && <Text>{inv.user.companyAddress}</Text>}
              {!!inv.user?.companyPhone && <Text>{inv.user.companyPhone}</Text>}
            </View>
            <View style={styles.card}>
              <Text style={styles.xs}>Bill To</Text>
              <Text style={styles.md}>{inv.client?.name || ''}</Text>
              {!!inv.client?.address && <Text>{inv.client.address}</Text>}
              {!!inv.client?.email && <Text>{inv.client.email}</Text>}
            </View>
            <View style={styles.card}>
              <Text style={styles.xs}>Dates</Text>
              <Text>Issue: {dateStr(inv.issueDate)}</Text>
              <Text>Due: {dateStr(inv.dueDate)}</Text>
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
            <View style={styles.row}><Text>Subtotal</Text><Text>{fmt((inv as any).subtotal)}</Text></View>
            <View style={styles.row}><Text>Tax</Text><Text>{fmt((inv as any).taxAmount)}</Text></View>
            <View style={[styles.row, { marginTop: 8 }]}><Text style={{ fontWeight: 700 }}>Total</Text><Text style={{ fontWeight: 700 }}>{fmt(inv.total)}</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}



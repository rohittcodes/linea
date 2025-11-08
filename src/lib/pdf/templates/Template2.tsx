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
  banner: { backgroundColor: tw.blue[50], paddingHorizontal: 28, paddingVertical: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  companyName: { fontSize: 14, fontWeight: 700 },
  companyEmail: { color: theme.text.muted, marginTop: 2 },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 9999, fontSize: 9 },
  content: { paddingHorizontal: 28, paddingVertical: 20 },
  grid3: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  card: { flexGrow: 1, padding: 10, borderWidth: 1, borderColor: theme.border, borderRadius: 6 },
  labelXs: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  valueLg: { fontSize: 18, fontWeight: 700, color: theme.text.primary, marginTop: 4 },
  valueMd: { fontSize: 12, fontWeight: 600, color: theme.text.primary, marginTop: 4 },
  twoCol: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 16 },
  tableWrap: { marginTop: 16, borderTopWidth: 2, borderColor: theme.border },
  thRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 2, borderColor: theme.border },
  th: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderColor: theme.subtleBorder },
  td: { fontSize: 10, color: theme.text.primary },
  right: { textAlign: 'right' },
  totalsBox: { width: 240, alignSelf: 'flex-end', marginTop: 16 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderColor: theme.border },
  totalFinal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, backgroundColor: tw.blue[50], borderRadius: 6, paddingHorizontal: 10, marginTop: 8 },
})

function statusColors(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'paid') return { backgroundColor: theme.badge.paidBg, color: theme.badge.paidText }
  if (s === 'overdue') return { backgroundColor: theme.badge.overdueBg, color: theme.badge.overdueText }
  if (s === 'sent') return { backgroundColor: theme.badge.sentBg, color: theme.badge.sentText }
  return { backgroundColor: theme.badge.defaultBg, color: theme.badge.defaultText }
}

export function generateTemplate2PDF(inv: InvoiceWithDetails) {
  const fmt = (n: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: (inv as any).currency || 'USD' }).format(Number(n || 0))
  const dateStr = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : '')
  const badgeStyle = statusColors(inv.status as any)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Banner header */}
        <View style={styles.banner}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.companyName}>{inv.user?.companyName || 'Your Company Name'}</Text>
              {!!inv.user?.companyEmail && <Text style={styles.companyEmail}>{inv.user.companyEmail}</Text>}
            </View>
            <View style={[styles.statusBadge, badgeStyle]}>
              <Text>{String(inv.status || '').toUpperCase()}</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Top grid */}
          <View style={styles.grid3}>
            <View style={styles.card}>
              <Text style={styles.labelXs}>Invoice</Text>
              <Text style={styles.valueLg}>#{(inv as any).invoiceNumber}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.labelXs}>Issue Date</Text>
              <Text style={styles.valueMd}>{dateStr(inv.issueDate)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.labelXs}>Due Date</Text>
              <Text style={styles.valueMd}>{dateStr(inv.dueDate)}</Text>
            </View>
          </View>

          {/* Parties */}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelXs}>Bill From</Text>
              <Text style={[styles.valueMd, { marginTop: 6 }]}>{inv.user?.companyName || 'Your Company'}</Text>
              {!!inv.user?.companyAddress && <Text>{inv.user.companyAddress}</Text>}
              {!!inv.user?.companyPhone && <Text>{inv.user.companyPhone}</Text>}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.labelXs}>Bill To</Text>
              <Text style={[styles.valueMd, { marginTop: 6 }]}>{inv.client?.name || ''}</Text>
              {!!inv.client?.address && <Text>{inv.client.address}</Text>}
              {!!inv.client?.email && <Text>{inv.client.email}</Text>}
            </View>
          </View>

          {/* Table */}
          <View style={styles.tableWrap}>
            <View style={styles.thRow}>
              <Text style={[styles.th, { flex: 6 }]}>Item</Text>
              <Text style={[styles.th, styles.right, { flex: 2 }]}>Qty</Text>
              <Text style={[styles.th, styles.right, { flex: 3 }]}>Rate</Text>
              <Text style={[styles.th, styles.right, { flex: 3 }]}>Amount</Text>
            </View>
            {inv.lineItems.map((li, idx) => (
              <View key={String(idx)} style={styles.tr}>
                <Text style={[styles.td, { flex: 6 }]}>{li.description}</Text>
                <Text style={[styles.td, styles.right, { flex: 2 }]}>{Number(li.quantity)}</Text>
                <Text style={[styles.td, styles.right, { flex: 3 }]}>{fmt(li.unitPrice)}</Text>
                <Text style={[styles.td, styles.right, { flex: 3 }]}>{fmt(li.amount)}</Text>
              </View>
            ))}
          </View>

          {/* Totals */}
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}><Text>Subtotal</Text><Text>{fmt((inv as any).subtotal)}</Text></View>
            <View style={styles.totalRow}><Text>Tax</Text><Text>{fmt((inv as any).taxAmount)}</Text></View>
            <View style={styles.totalFinal}><Text>Total</Text><Text>{fmt(inv.total)}</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  )
}



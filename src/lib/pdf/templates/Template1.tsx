import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { pdfTheme as theme, tw } from '../theme'
import type { Invoice, Client, LineItem, User } from '@prisma/client'

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  lineItems: LineItem[];
  user: User;
}

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, color: theme.text.primary },
  headerTitle: { fontSize: 22, fontWeight: 700 },
  light: { color: theme.text.muted },
  row: { flexDirection: 'row' },
  col: { flexDirection: 'column' },
  between: { justifyContent: 'space-between' },
  mt2: { marginTop: 8 },
  mt3: { marginTop: 12 },
  mt4: { marginTop: 16 },
  badge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, fontSize: 9 },
  table: { width: '100%', borderTopWidth: 1, borderColor: theme.border, marginTop: 12 },
  th: { paddingVertical: 8, fontSize: 9, color: theme.text.muted },
  tr: { borderBottomWidth: 1, borderColor: theme.subtleBorder, paddingVertical: 8 },
  td: { fontSize: 10 },
  right: { textAlign: 'right' },
  totalsBox: { width: 200, alignSelf: 'flex-end', marginTop: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
})

function statusColors(status: string) {
  const s = (status || '').toLowerCase()
  if (s === 'paid') return { backgroundColor: theme.badge.paidBg, color: theme.badge.paidText }
  if (s === 'overdue') return { backgroundColor: theme.badge.overdueBg, color: theme.badge.overdueText }
  if (s === 'sent') return { backgroundColor: theme.badge.sentBg, color: theme.badge.sentText }
  return { backgroundColor: theme.badge.defaultBg, color: theme.badge.defaultText }
}

export function generateTemplate1PDF(inv: InvoiceWithDetails) {
  const fmt = (n: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: (inv as any).currency || 'USD' }).format(Number(n || 0))
  const dateStr = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : '')
  const badgeStyle = statusColors(inv.status as any)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.row, styles.between]}> 
          <View style={styles.col}>
            <Text style={styles.headerTitle}>INVOICE</Text>
            <Text style={[styles.mt2, styles.light]}>#{(inv as any).invoiceNumber}</Text>
          </View>
          <View style={[styles.badge, badgeStyle]}> 
            <Text>{String(inv.status || '').toUpperCase()}</Text>
          </View>
        </View>

        {/* Parties + dates */}
        <View style={[styles.row, styles.between, styles.mt4]}> 
          <View style={{ width: '48%' }}>
            <Text style={styles.light}>FROM</Text>
            <Text style={{ fontWeight: 700, marginTop: 4 }}>{inv.user?.companyName || 'Your Company'}</Text>
            {!!inv.user?.companyAddress && <Text style={styles.mt2}>{inv.user.companyAddress}</Text>}
            {!!inv.user?.companyEmail && <Text style={styles.mt2}>{inv.user.companyEmail}</Text>}
            {!!inv.user?.companyPhone && <Text style={styles.mt2}>{inv.user.companyPhone}</Text>}
          </View>
          <View style={{ width: '48%' }}>
            <Text style={styles.light}>TO</Text>
            <Text style={{ fontWeight: 700, marginTop: 4 }}>{inv.client?.name || ''}</Text>
            {!!inv.client?.address && <Text style={styles.mt2}>{inv.client.address}</Text>}
            {!!inv.client?.email && <Text style={styles.mt2}>{inv.client.email}</Text>}
            <View style={[styles.row, styles.mt3, styles.between]}>
              <View>
                <Text style={styles.light}>DATE</Text>
                <Text>{dateStr(inv.issueDate)}</Text>
              </View>
              <View>
                <Text style={styles.light}>DUE DATE</Text>
                <Text>{dateStr(inv.dueDate)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          <View style={[styles.row, styles.tr]}> 
            <Text style={{ flex: 6, ...styles.th }}>DESCRIPTION</Text>
            <Text style={{ flex: 2, ...styles.th, ...styles.right }}>QTY</Text>
            <Text style={{ flex: 3, ...styles.th, ...styles.right }}>RATE</Text>
            <Text style={{ flex: 3, ...styles.th, ...styles.right }}>AMOUNT</Text>
          </View>
          {inv.lineItems.map((li, idx) => (
            <View key={String(idx)} style={[styles.row, styles.tr]}> 
              <Text style={{ flex: 6, ...styles.td }}>{li.description}</Text>
              <Text style={{ flex: 2, ...styles.td, ...styles.right }}>{Number(li.quantity)}</Text>
              <Text style={{ flex: 3, ...styles.td, ...styles.right }}>{fmt(li.unitPrice)}</Text>
              <Text style={{ flex: 3, ...styles.td, ...styles.right }}>{fmt(li.amount)}</Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totalsBox}>
          <View style={styles.totalRow}><Text style={styles.light}>Subtotal</Text><Text>{fmt((inv as any).subtotal)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.light}>Tax</Text><Text>{fmt((inv as any).taxAmount)}</Text></View>
          <View style={[styles.totalRow, { marginTop: 6 }]}><Text style={{ fontWeight: 700 }}>Total</Text><Text style={{ fontWeight: 700 }}>{fmt(inv.total)}</Text></View>
        </View>
      </Page>
    </Document>
  )
}



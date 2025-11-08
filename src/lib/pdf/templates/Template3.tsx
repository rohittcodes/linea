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
  bar: { height: 6, width: '100%', backgroundColor: tw.violet[600] }, // gradient fallback
  header: { paddingHorizontal: 28, paddingTop: 16, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  titleWrap: {},
  title: { fontSize: 18, fontWeight: 700 },
  invNum: { color: theme.text.muted, marginTop: 2 },
  dates: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dateBlock: { textAlign: 'right' },
  dateLabel: { fontSize: 9, color: theme.text.muted },
  dateValue: { fontSize: 12, fontWeight: 600 },
  body: { flexDirection: 'row' },
  aside: { width: 200, backgroundColor: tw.gray[50], borderRightWidth: 1, borderColor: theme.border, padding: 16, gap: 16 },
  sectionLabel: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  sectionValue: { fontSize: 11, fontWeight: 600, marginTop: 4 },
  sectionLine: { fontSize: 10, color: tw.gray[700], marginTop: 2 },
  main: { flexGrow: 1, padding: 16 },
  tableWrap: { borderWidth: 1, borderColor: theme.border, borderRadius: 4, overflow: 'hidden' },
  thRow: { flexDirection: 'row', backgroundColor: theme.tableHeaderBg, paddingVertical: 8 },
  th: { fontSize: 9, color: theme.text.muted, textTransform: 'uppercase' },
  tr: { flexDirection: 'row', paddingVertical: 8, borderTopWidth: 1, borderColor: theme.subtleBorder },
  td: { fontSize: 10, color: theme.text.primary },
  right: { textAlign: 'right' },
  totalsWrap: { marginTop: 12, flexDirection: 'row', justifyContent: 'flex-end' },
  totalsCard: { width: 220, borderWidth: 1, borderColor: theme.border, borderRadius: 4, padding: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
})

export function generateTemplate3PDF(inv: InvoiceWithDetails) {
  const fmt = (n: any) => new Intl.NumberFormat('en-US', { style: 'currency', currency: (inv as any).currency || 'USD' }).format(Number(n || 0))
  const dateStr = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : '')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.bar} />
        <View style={styles.header}>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>Invoice</Text>
            <Text style={styles.invNum}>#{(inv as any).invoiceNumber}</Text>
          </View>
          <View style={styles.dates}>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Issue</Text>
              <Text style={styles.dateValue}>{dateStr(inv.issueDate)}</Text>
            </View>
            <View style={styles.dateBlock}>
              <Text style={styles.dateLabel}>Due</Text>
              <Text style={styles.dateValue}>{dateStr(inv.dueDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Sidebar */}
          <View style={styles.aside}>
            <View>
              <Text style={styles.sectionLabel}>From</Text>
              <Text style={styles.sectionValue}>{inv.user?.companyName || 'Your Company Name'}</Text>
              {!!inv.user?.companyAddress && <Text style={styles.sectionLine}>{inv.user.companyAddress}</Text>}
              {!!inv.user?.companyEmail && <Text style={styles.sectionLine}>{inv.user.companyEmail}</Text>}
              {!!inv.user?.companyPhone && <Text style={styles.sectionLine}>{inv.user.companyPhone}</Text>}
            </View>
            <View>
              <Text style={styles.sectionLabel}>Bill To</Text>
              <Text style={styles.sectionValue}>{inv.client?.name || ''}</Text>
              {!!inv.client?.address && <Text style={styles.sectionLine}>{inv.client.address}</Text>}
              {!!inv.client?.email && <Text style={styles.sectionLine}>{inv.client.email}</Text>}
            </View>
          </View>

          {/* Main content */}
          <View style={styles.main}>
            <View style={styles.tableWrap}>
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

            <View style={styles.totalsWrap}>
              <View style={styles.totalsCard}>
                <View style={styles.totalRow}><Text>Subtotal</Text><Text>{fmt((inv as any).subtotal)}</Text></View>
                <View style={styles.totalRow}><Text>Tax</Text><Text>{fmt((inv as any).taxAmount)}</Text></View>
                <View style={[styles.totalRow, { marginTop: 6 }]}><Text style={{ fontWeight: 700 }}>Total</Text><Text style={{ fontWeight: 700 }}>{fmt(inv.total)}</Text></View>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  )
}



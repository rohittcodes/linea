import type { Invoice, Client, LineItem, User } from '@prisma/client'

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  lineItems: LineItem[];
  user: User;
}

export function renderTemplate1Email(invoice: InvoiceWithDetails) {
  const fmt = (n: any) => `$${Number(n || 0).toFixed(2)}`
  const issue = new Date(invoice.issueDate).toLocaleDateString()
  const due = new Date(invoice.dueDate).toLocaleDateString()
  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invoice #${invoice.invoiceNumber}</title></head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:24px 24px 16px 24px;border-bottom:1px solid #eef2f7;">
              <table width="100%" role="presentation"><tr>
                <td style="font-size:24px;font-weight:800;">INVOICE</td>
                <td align="right"><span style="display:inline-block;padding:6px 10px;border-radius:8px;background:#eef2f7;color:#111;font-size:12px;font-weight:700;text-transform:uppercase;">${String(invoice.status || '').toUpperCase()}</span></td>
              </tr></table>
              <div style="margin-top:4px;color:#6b7280;">#${invoice.invoiceNumber}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
                <td width="50%" valign="top">
                  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">From</div>
                  <div style="font-weight:700;margin-top:6px;">${invoice.user.companyName || 'Your Company'}</div>
                  ${invoice.user.companyAddress ? `<div style=\"color:#374151;margin-top:4px;\">${invoice.user.companyAddress}</div>` : ''}
                  ${invoice.user.companyEmail ? `<div style=\"color:#374151;margin-top:4px;\">${invoice.user.companyEmail}</div>` : ''}
                </td>
                <td width="50%" valign="top">
                  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Bill To</div>
                  <div style="font-weight:700;margin-top:6px;">${invoice.client.name}</div>
                  ${invoice.client.address ? `<div style=\"color:#374151;margin-top:4px;\">${invoice.client.address}</div>` : ''}
                  ${invoice.client.email ? `<div style=\"color:#374151;margin-top:4px;\">${invoice.client.email}</div>` : ''}
                </td>
              </tr></table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                <tr>
                  <td style="font-size:11px;color:#6b7280;">DATE</td>
                  <td align="right" style="font-weight:600;">${issue}</td>
                </tr>
                <tr>
                  <td style="font-size:11px;color:#6b7280;">DUE DATE</td>
                  <td align="right" style="font-weight:600;">${due}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-top:1px solid #e5e7eb;">
                <tr>
                  <th align="left" style="padding:10px 0;color:#6b7280;font-size:12px;">DESCRIPTION</th>
                  <th align="right" style="padding:10px 0;color:#6b7280;font-size:12px;">QTY</th>
                  <th align="right" style="padding:10px 0;color:#6b7280;font-size:12px;">RATE</th>
                  <th align="right" style="padding:10px 0;color:#6b7280;font-size:12px;">AMOUNT</th>
                </tr>
                ${invoice.lineItems.map(li => `
                  <tr style=\"border-top:1px solid #f3f4f6;\">
                    <td style=\"padding:10px 0;\">${li.description}</td>
                    <td align=\"right\" style=\"padding:10px 0;\">${Number(li.quantity)}</td>
                    <td align=\"right\" style=\"padding:10px 0;\">${fmt(li.unitPrice)}</td>
                    <td align=\"right\" style=\"padding:10px 0;\">${fmt(li.amount)}</td>
                  </tr>
                `).join('')}
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                <tr><td></td><td width="220">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr><td style="color:#6b7280;">Subtotal</td><td align="right">${fmt((invoice as any).subtotal)}</td></tr>
                    <tr><td style="color:#6b7280;">Tax</td><td align="right">${fmt((invoice as any).taxAmount)}</td></tr>
                    <tr><td style="font-weight:700;padding-top:8px;border-top:1px solid #e5e7eb;">Total</td><td align="right" style="font-weight:700;">${fmt(invoice.total)}</td></tr>
                  </table>
                </td></tr>
              </table>

              <div style="text-align:center;margin-top:20px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/invoice/${invoice.id}" style="display:inline-block;background:#2388ff;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;">View Invoice Online</a>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}



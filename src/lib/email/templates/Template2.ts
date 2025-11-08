import type { Invoice, Client, LineItem, User } from '@prisma/client'

export interface InvoiceWithDetails extends Invoice {
  client: Client;
  lineItems: LineItem[];
  user: User;
}

export function renderTemplate2Email(invoice: InvoiceWithDetails) {
  const fmt = (n: any) => `$${Number(n || 0).toFixed(2)}`
  const issue = new Date(invoice.issueDate).toLocaleDateString()
  const due = new Date(invoice.dueDate).toLocaleDateString()
  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invoice #${invoice.invoiceNumber}</title></head>
  <body style="margin:0;padding:0;background:#ffffff;font-family:Arial,Helvetica,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px;background:#111827;color:#fff;">
              <table width="100%" role="presentation"><tr>
                <td style="font-size:22px;font-weight:800;letter-spacing:0.5px;">${invoice.user.companyName || 'Your Company'}</td>
                <td align="right" style="font-size:12px;">Invoice <strong>#${invoice.invoiceNumber}</strong></td>
              </tr></table>
              <div style="margin-top:6px;color:#d1d5db;">Issued ${issue} • Due ${due}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
                <td width="50%" valign="top">
                  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Bill From</div>
                  <div style="font-weight:700;margin-top:6px;">${invoice.user.companyName || 'Your Company'}</div>
                  ${invoice.user.companyAddress ? `<div style=\"color:#374151;margin-top:4px;\">${invoice.user.companyAddress}</div>` : ''}
                </td>
                <td width="50%" valign="top">
                  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Bill To</div>
                  <div style="font-weight:700;margin-top:6px;">${invoice.client.name}</div>
                  ${invoice.client.address ? `<div style=\"color:#374151;margin-top:4px;\">${invoice.client.address}</div>` : ''}
                </td>
              </tr></table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;border-collapse:collapse;">
                <tr style="background:#f9fafb;border-bottom:1px solid #e5e7eb;">
                  <th align="left" style="padding:10px;color:#374151;font-size:12px;">Item</th>
                  <th align="right" style="padding:10px;color:#374151;font-size:12px;">Qty</th>
                  <th align="right" style="padding:10px;color:#374151;font-size:12px;">Rate</th>
                  <th align="right" style="padding:10px;color:#374151;font-size:12px;">Amount</th>
                </tr>
                ${invoice.lineItems.map(li => `
                  <tr style=\"border-bottom:1px solid #f3f4f6;\">
                    <td style=\"padding:10px;\">${li.description}</td>
                    <td align=\"right\" style=\"padding:10px;\">${Number(li.quantity)}</td>
                    <td align=\"right\" style=\"padding:10px;\">${fmt(li.unitPrice)}</td>
                    <td align=\"right\" style=\"padding:10px;\">${fmt(li.amount)}</td>
                  </tr>
                `).join('')}
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:16px;">
                <tr>
                  <td></td>
                  <td width="240">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr><td style="color:#6b7280;">Subtotal</td><td align="right">${fmt((invoice as any).subtotal)}</td></tr>
                      <tr><td style="color:#6b7280;">Tax</td><td align="right">${fmt((invoice as any).taxAmount)}</td></tr>
                      <tr><td style="font-weight:700;border-top:1px solid #e5e7eb;padding-top:8px;">Total</td><td align="right" style="font-weight:700;">${fmt(invoice.total)}</td></tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="text-align:center;margin-top:20px;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/invoice/${invoice.id}" style="display:inline-block;background:#111827;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none;">View Invoice</a>
              </div>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}



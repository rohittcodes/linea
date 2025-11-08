import nodemailer from "nodemailer";
import { Invoice, Client, LineItem, User, Template } from "@prisma/client";
import { getInvoiceUrl } from "./config";
import { renderTemplate1Email } from './email/templates/Template1'
import { renderTemplate2Email } from './email/templates/Template2'
import { renderTemplate3Email } from './email/templates/Template3'
import { renderTemplate4Email } from './email/templates/Template4'
import { renderTemplate5Email } from './email/templates/Template5'
import { renderTemplate6Email } from './email/templates/Template6'
import { prisma } from './db'

// Create transporter using the same Gmail SMTP configuration
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
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

// Generate email HTML using custom template configuration
function renderCustomTemplateEmail(invoice: InvoiceWithDetails, template: Template) {
  const design = template.design as any;
  const branding = template.branding as any;

  const primaryColor = design?.primaryColor || '#2388ff';
  const secondaryColor = design?.secondaryColor || '#f8fafc';
  const fontFamily = design?.fontFamily || 'Arial, Helvetica, sans-serif';
  const fontSize = design?.fontSize || '14px';

  const companyName = branding?.companyName || invoice.user.companyName || 'Your Company';
  const companyAddress = branding?.companyAddress || invoice.user.companyAddress;
  const companyEmail = branding?.companyEmail || invoice.user.companyEmail;
  const companyPhone = branding?.companyPhone || invoice.user.companyPhone;

  const fmt = (n: any) => `$${Number(n || 0).toFixed(2)}`;
  const issue = new Date(invoice.issueDate).toLocaleDateString();
  const due = new Date(invoice.dueDate).toLocaleDateString();

  return `
  <!DOCTYPE html>
  <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Invoice #${invoice.invoiceNumber}</title></head>
  <body style="margin:0;padding:0;background:#f5f7fb;font-family:${fontFamily};color:#111;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7fb;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <tr>
            <td style="padding:24px 24px 16px 24px;border-bottom:2px solid ${primaryColor};">
              <table width="100%" role="presentation"><tr>
                <td style="font-size:24px;font-weight:800;color:${primaryColor};">INVOICE</td>
                <td align="right"><span style="display:inline-block;padding:6px 10px;border-radius:8px;background:${secondaryColor};color:${primaryColor};font-size:12px;font-weight:700;text-transform:uppercase;">${String(invoice.status || '').toUpperCase()}</span></td>
              </tr></table>
              <div style="margin-top:4px;color:#6b7280;font-size:${fontSize};">#${invoice.invoiceNumber}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr>
                <td width="50%" valign="top">
                  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">From</div>
                  <div style="font-weight:700;margin-top:6px;font-size:${fontSize};">${companyName}</div>
                  ${companyAddress ? `<div style="color:#374151;margin-top:4px;font-size:${fontSize};">${companyAddress}</div>` : ''}
                  ${companyEmail ? `<div style="color:#374151;margin-top:4px;font-size:${fontSize};">${companyEmail}</div>` : ''}
                  ${companyPhone ? `<div style="color:#374151;margin-top:4px;font-size:${fontSize};">${companyPhone}</div>` : ''}
                </td>
                <td width="50%" valign="top">
                  <div style="font-size:11px;color:#6b7280;text-transform:uppercase;">Bill To</div>
                  <div style="font-weight:700;margin-top:6px;font-size:${fontSize};">${invoice.client.name}</div>
                  ${invoice.client.address ? `<div style="color:#374151;margin-top:4px;font-size:${fontSize};">${invoice.client.address}</div>` : ''}
                  ${invoice.client.email ? `<div style="color:#374151;margin-top:4px;font-size:${fontSize};">${invoice.client.email}</div>` : ''}
                </td>
              </tr></table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:12px;">
                <tr>
                  <td style="font-size:11px;color:#6b7280;">DATE</td>
                  <td align="right" style="font-weight:600;font-size:${fontSize};">${issue}</td>
                </tr>
                <tr>
                  <td style="font-size:11px;color:#6b7280;">DUE DATE</td>
                  <td align="right" style="font-weight:600;font-size:${fontSize};">${due}</td>
                </tr>
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;border-top:1px solid #e5e7eb;">
                <tr style="background:${secondaryColor};">
                  <th style="padding:12px;text-align:left;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;">Description</th>
                  <th style="padding:12px;text-align:right;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;">Qty</th>
                  <th style="padding:12px;text-align:right;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;">Rate</th>
                  <th style="padding:12px;text-align:right;font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;">Amount</th>
                </tr>
                ${invoice.lineItems.map(item => `
                <tr style="border-bottom:1px solid #f3f4f6;">
                  <td style="padding:12px;font-size:${fontSize};">${item.description}</td>
                  <td style="padding:12px;text-align:right;font-size:${fontSize};">${Number(item.quantity)}</td>
                  <td style="padding:12px;text-align:right;font-size:${fontSize};">${fmt(item.unitPrice)}</td>
                  <td style="padding:12px;text-align:right;font-size:${fontSize};">${fmt(item.amount)}</td>
                </tr>
                `).join('')}
              </table>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
                <tr>
                  <td align="right">
                    <table role="presentation" cellspacing="0" cellpadding="0" style="width:200px;">
                      <tr>
                        <td style="padding:6px 0;font-size:${fontSize};">Subtotal</td>
                        <td align="right" style="padding:6px 0;font-size:${fontSize};">${fmt(invoice.subtotal)}</td>
                      </tr>
                      ${Number(invoice.taxAmount) > 0 ? `
                      <tr>
                        <td style="padding:6px 0;font-size:${fontSize};">Tax</td>
                        <td align="right" style="padding:6px 0;font-size:${fontSize};">${fmt(invoice.taxAmount)}</td>
                      </tr>
                      ` : ''}
                      ${Number(invoice.discountAmount) > 0 ? `
                      <tr>
                        <td style="padding:6px 0;font-size:${fontSize};">Discount</td>
                        <td align="right" style="padding:6px 0;font-size:${fontSize};">-${fmt(invoice.discountAmount)}</td>
                      </tr>
                      ` : ''}
                      <tr style="border-top:2px solid ${primaryColor};">
                        <td style="padding:12px 0;font-size:16px;font-weight:700;">Total</td>
                        <td align="right" style="padding:12px 0;font-size:16px;font-weight:700;color:${primaryColor};">${fmt(invoice.total)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              ${invoice.notes ? `
              <div style="margin-top:24px;padding:16px;background:${secondaryColor};border-radius:8px;">
                <div style="font-weight:700;margin-bottom:8px;font-size:${fontSize};">Notes:</div>
                <div style="font-size:${fontSize};color:#374151;">${invoice.notes}</div>
              </div>
              ` : ''}
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body></html>
  `;
}

export async function sendInvoiceEmail(
  invoice: InvoiceWithDetails,
  pdfBuffer?: Buffer,
  recipientEmail?: string,
) {
  let attachmentBuffer = pdfBuffer
  if (!attachmentBuffer) {
    try {
      const base = process.env.NEXT_PUBLIC_BASE_URL || ''
      const res = await fetch(`${base}/api/invoices/${invoice.id}/pdf`)
      if (res.ok) {
        const ab = await res.arrayBuffer()
        attachmentBuffer = Buffer.from(ab)
      }
    } catch {}
  }
  const templateId = (invoice as any).templateId || (invoice as any).template?.id;
  let emailContent = '';

  // If no templateId, use default
  if (!templateId) {
    emailContent = renderTemplate1Email(invoice);
  } else if (isUUID(templateId)) {
    // Custom template - fetch from DB if not already included
    let template = invoice.template;
    if (!template) {
      template = await prisma.template.findUnique({
        where: { id: templateId }
      });
    }
    
    if (template) {
      emailContent = renderCustomTemplateEmail(invoice, template);
    } else {
      // Fallback to template1 if custom template not found
      console.warn(`Custom template ${templateId} not found, falling back to template1`);
      emailContent = renderTemplate1Email(invoice);
    }
  } else {
    // Built-in template (template1-6)
    switch (templateId) {
      case 'template1':
        emailContent = renderTemplate1Email(invoice);
        break;
      case 'template2':
        emailContent = renderTemplate2Email(invoice);
        break;
      case 'template3':
        emailContent = renderTemplate3Email(invoice);
        break;
      case 'template4':
        emailContent = renderTemplate4Email(invoice);
        break;
      case 'template5':
        emailContent = renderTemplate5Email(invoice);
        break;
      case 'template6':
        emailContent = renderTemplate6Email(invoice);
        break;
      default:
        emailContent = renderTemplate1Email(invoice);
    }
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || invoice.user.companyEmail || invoice.user.email,
    to: recipientEmail || invoice.client.email,
    subject: `Invoice #${invoice.invoiceNumber} - ${invoice.client.name}`,
    html: emailContent,
    attachments: attachmentBuffer ? [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: attachmentBuffer,
        contentType: "application/pdf",
      },
    ] : undefined,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send invoice email:", error);
    throw new Error("Failed to send invoice email");
  }
}

export async function sendInvoiceReminder(
  invoice: InvoiceWithDetails,
  recipientEmail?: string,
) {
  const daysOverdue = Math.ceil(
    (Date.now() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24),
  );

  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Reminder - Invoice #${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #d32f2f; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .reminder-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #d32f2f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Payment Reminder</h1>
          <p>Invoice #${invoice.invoiceNumber}</p>
        </div>
        
        <div class="content">
          <div class="reminder-details">
            <h2>Payment Due</h2>
            <p><strong>Client:</strong> ${invoice.client.name}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p><strong>Amount Due:</strong> $${Number(invoice.total).toFixed(2)}</p>
            ${daysOverdue > 0 ? `<p><strong>Days Overdue:</strong> ${daysOverdue}</p>` : ""}
          </div>
          
          <p style="color: #666; font-size: 16px;">
            This is a friendly reminder that payment for the above invoice is due. 
            Please process the payment at your earliest convenience.
          </p>
          
          <p style="color: #666; font-size: 16px;">
            If you have already made the payment, please disregard this reminder.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="button">View Invoice</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This reminder was sent from ${invoice.user.companyName || 'Your Company'}</p>
          <p>If you have any questions, please contact us at ${invoice.user.companyEmail || invoice.user.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || invoice.user.companyEmail || invoice.user.email,
    to: recipientEmail || invoice.client.email,
    subject: `Payment Reminder - Invoice #${invoice.invoiceNumber}`,
    html: emailContent,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send invoice reminder:", error);
    throw new Error("Failed to send invoice reminder");
  }
}

export async function sendWelcomeEmail(user: User) {
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Linea</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2388ff; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #2388ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Linea!</h1>
          <p>Your invoice management system</p>
        </div>
        
        <div class="content">
          <h2>Hello ${user.name || 'there'}!</h2>
          
          <p>Welcome to Linea, your professional invoice management system. We're excited to help you streamline your invoicing process.</p>
          
          <h3>Getting Started</h3>
          <ul>
            <li>Set up your company information in Settings</li>
            <li>Add your first client</li>
            <li>Create and send your first invoice</li>
            <li>Track payments and manage your business</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/dashboard" class="button">Get Started</a>
          </div>
          
          <p>If you have any questions or need help getting started, don't hesitate to reach out to our support team.</p>
        </div>
        
        <div class="footer">
          <p>Thank you for choosing Linea!</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: "Welcome to Linea - Your Invoice Management System",
    html: emailContent,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}

import nodemailer from "nodemailer";
import { Invoice, Client, LineItem, User } from "@prisma/client";
import { getInvoiceUrl } from "./config";

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
}

export async function sendInvoiceEmail(
  invoice: InvoiceWithDetails,
  pdfBuffer?: Buffer,
  recipientEmail?: string,
) {
  const emailContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice #${invoice.invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2388ff; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .invoice-details { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .line-items { margin: 20px 0; }
        .line-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 18px; text-align: right; margin-top: 20px; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #2388ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice #${invoice.invoiceNumber}</h1>
          <p>From: ${invoice.user.companyName || 'Your Company'}</p>
        </div>
        
        <div class="content">
          <div class="invoice-details">
            <h2>Invoice Details</h2>
            <p><strong>Client:</strong> ${invoice.client.name}</p>
            <p><strong>Issue Date:</strong> ${new Date(invoice.issueDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
            ${invoice.description ? `<p><strong>Description:</strong> ${invoice.description}</p>` : ''}
          </div>
          
          <div class="line-items">
            <h3>Items</h3>
            ${invoice.lineItems.map(item => `
              <div class="line-item">
                <div>
                  <strong>${item.description}</strong>
                  ${item.notes ? `<br><small>${item.notes}</small>` : ''}
                </div>
                <div>
                  ${item.quantity} × $${Number(item.unitPrice).toFixed(2)} = $${Number(item.amount).toFixed(2)}
                </div>
              </div>
            `).join('')}
            
            <div class="total">
              <div>Subtotal: $${Number(invoice.subtotal).toFixed(2)}</div>
              ${Number(invoice.taxAmount) > 0 ? `<div>Tax: $${Number(invoice.taxAmount).toFixed(2)}</div>` : ''}
              <div style="font-size: 20px; margin-top: 10px;">Total: $${Number(invoice.total).toFixed(2)}</div>
            </div>
          </div>
          
          ${invoice.notes ? `
            <div class="invoice-details">
              <h3>Notes</h3>
              <p>${invoice.notes}</p>
            </div>
          ` : ''}
          
          ${invoice.terms ? `
            <div class="invoice-details">
              <h3>Terms & Conditions</h3>
              <p>${invoice.terms}</p>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${getInvoiceUrl(invoice.id)}" class="button">View Invoice Online</a>
          </div>
        </div>
        
        <div class="footer">
          <p>This invoice was sent from ${invoice.user.companyName || 'Your Company'}</p>
          <p>If you have any questions, please contact us at ${invoice.user.companyEmail || invoice.user.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_FROM || invoice.user.companyEmail || invoice.user.email,
    to: recipientEmail || invoice.client.email,
    subject: `Invoice #${invoice.invoiceNumber} - ${invoice.client.name}`,
    html: emailContent,
    attachments: pdfBuffer ? [
      {
        filename: `invoice-${invoice.invoiceNumber}.pdf`,
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    ] : undefined,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log("Invoice email sent successfully:", result.messageId);
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
    console.log("Invoice reminder sent successfully:", result.messageId);
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
    console.log("Welcome email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send welcome email:", error);
    throw new Error("Failed to send welcome email");
  }
}

# Provisional IRN (Demo) Mode

This mode lets you demo e‑invoicing without IRP/GSP access. It generates a deterministic provisional IRN and QR locally (NOT government‑registered). Later, paste the official IRN when you receive it.

## Enable

Create `.env.local` and set:

EINV_DEMO_MODE=true

Accepted values: true, 1, yes (case‑insensitive). Restart the dev server after changes.

Debug: GET /api/debug/demo → { EINV_DEMO_MODE, NEXT_RUNTIME, NODE_VERSION }

## Usage

- Generate Provisional IRN (demo)
  - UI: Invoices → row menu → Generate Provisional IRN
  - API: POST /api/einvoicing/demo/register/{invoiceId}
- Enter Official IRN (later backfill)
  - UI: Invoices → row menu → Enter Official IRN
  - API: POST /api/einvoicing/manual/{invoiceId} with body { "irn": "..." }

## Data Stored

- invoice.demoIrn – provisional IRN (demo)
- invoice.demoQrPng – QR image (base64)
- invoice.demoIrnCreatedAt – timestamp
- invoice.irnManual – official IRN (optional, pasted later)
- invoice.irnManualAt – timestamp

Note: invoiceNumber is unchanged.

## Preconditions

- Demo flag enabled (EINV_DEMO_MODE=true)
- Seller GSTIN present (users.tax_number)
- Buyer GSTIN present (clients.tax_number)
- Invoice exists with at least one line item

On failure (HTTP 400) you’ll see one of:
- demo_mode_disabled:<value> – env is off/not loaded
- invoice_not_found – id is wrong
- missing_gstin – add GSTIN(s) to user/client

## Notes

- Provisional IRN is for demo only; not government‑registered.
- When IRP/GSP access is ready, replace with the real flow and/or backfill irnManual.

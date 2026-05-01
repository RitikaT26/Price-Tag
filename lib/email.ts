import { Resend } from 'resend'
import { TrackedProduct, PriceAlert } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPriceAlertEmail(
  email: string,
  product: TrackedProduct,
  alert: PriceAlert,
  currentPrice: number
) {
  const savings = alert.target_price - currentPrice
  const savingsPct = ((savings / alert.target_price) * 100).toFixed(0)

  await resend.emails.send({
    from: 'Pricetag <alerts@yourdomain.com>',
    to: email,
    subject: `🏷️ Price drop! ${product.title?.slice(0, 50)} is now ₹${currentPrice.toLocaleString()}`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0A0A0F;font-family:'Helvetica Neue',sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="background:#111118;border:1px solid #1E1E2E;border-radius:16px;overflow:hidden;">
      <!-- Header -->
      <div style="background:#B8FF3A;padding:24px 32px;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.12em;color:#0A0A0F;text-transform:uppercase;">Pricetag Alert</p>
        <h1 style="margin:8px 0 0;font-size:28px;font-weight:800;color:#0A0A0F;line-height:1.2;">Price Drop!</h1>
      </div>
      <!-- Product -->
      <div style="padding:32px;">
        <p style="margin:0 0 24px;font-size:16px;color:#C4C4D4;line-height:1.6;">
          <strong style="color:#fff;">${product.title}</strong> has dropped to your target price.
        </p>
        <!-- Price box -->
        <div style="background:#1A1A2E;border:1px solid #FF3D2E;border-radius:12px;padding:24px;margin-bottom:24px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;">
            <div>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;color:#7A7A9A;text-transform:uppercase;">Current Price</p>
              <p style="margin:0;font-size:36px;font-weight:800;color:#FF3D2E;">₹${currentPrice.toLocaleString()}</p>
            </div>
            <div>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;color:#7A7A9A;text-transform:uppercase;">Your Target</p>
              <p style="margin:0;font-size:36px;font-weight:800;color:#fff;">₹${alert.target_price.toLocaleString()}</p>
            </div>
            <div>
              <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;color:#7A7A9A;text-transform:uppercase;">You Save</p>
              <p style="margin:0;font-size:36px;font-weight:800;color:#B8FF3A;">${savingsPct}%</p>
            </div>
          </div>
        </div>
        <!-- CTA -->
        <a href="${product.url}" style="display:block;text-align:center;background:#FF3D2E;color:#fff;text-decoration:none;padding:16px 32px;border-radius:10px;font-weight:700;font-size:16px;letter-spacing:0.02em;">
          Buy Now →
        </a>
        <p style="margin:20px 0 0;font-size:12px;color:#3A3A5C;text-align:center;">
          You set this alert on Pricetag. <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="color:#7A7A9A;">Manage your alerts</a>
        </p>
      </div>
    </div>
  </div>
</body>
</html>
    `
  })
}

# Resend Setup

This app sends production email through Resend.

## Recommended sender setup

- Domain: `ruu-dev.com`
- Recommended sending subdomain: `send.ruu-dev.com`
- From address: `no-reply@send.ruu-dev.com`
- Reply-To address: `hello@ruu-dev.com`

Resend recommends using a subdomain for sending so email reputation is isolated from your main website traffic.

## Cloudflare / Resend steps

1. Add your domain or sending subdomain in Resend.
2. Copy the DNS records shown by Resend into Cloudflare.
3. Wait until the domain is verified in Resend.
4. Create a production API key in Resend.
5. Set the environment variables below in production.

## Production environment variables

```env
RESEND_API_KEY=re_xxxxxxxxx
MAILER_FROM_EMAIL=no-reply@send.ruu-dev.com
MAILER_FROM_NAME=Ruu Dev Booking
MAILER_REPLY_TO=hello@ruu-dev.com
APP_HOST=booking.ruu-dev.com
```

## Notes

- `MAILER_FROM_EMAIL` must belong to a verified Resend domain.
- If you have not verified a custom domain yet, production delivery will fail.
- Development still writes emails to `tmp/mails`.

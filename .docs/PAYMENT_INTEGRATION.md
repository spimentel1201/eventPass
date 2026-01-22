# 💳 Payment Gateway Integration - NeonPass

## Overview

This document describes the payment integration architecture for NeonPass, supporting **Stripe** (international) and **MercadoPago** (Latam/Peru).

---

## Architecture

```
┌─────────────────┐     ┌──────────────────────────────────────┐
│   Frontend      │────▶│          Backend API                 │
│  (Next.js)      │     │                                      │
│                 │     │  ┌────────────────────────────────┐  │
│  PaymentModal   │     │  │     PaymentGatewayPort         │  │
│  StripeCheckout │     │  │     (Interface)                │  │
│  MPCheckout     │     │  └────────────────────────────────┘  │
└─────────────────┘     │           │                          │
                        │     ┌─────┴─────┐                    │
                        │     ▼           ▼                    │
                        │  ┌──────┐   ┌──────────┐             │
                        │  │Stripe│   │MercadoPago│            │
                        │  │Adapter│  │Adapter    │            │
                        │  └──────┘   └──────────┘             │
                        └──────────────────────────────────────┘
```

---

## Payment Flow

### 1. Create Payment Intent
```
POST /api/v1/payments/create-intent
{
  "orderId": "uuid",
  "provider": "STRIPE" | "MERCADOPAGO",
  "amount": 150.00,
  "currency": "PEN"
}
```

### 2. Client-Side Checkout
- Stripe: Use Stripe Elements or Checkout
- MercadoPago: Use Checkout Pro or Brick

### 3. Webhook Confirmation
- Stripe: `POST /api/v1/webhooks/stripe`
- MercadoPago: `POST /api/v1/webhooks/mercadopago`

### 4. Order Completion
- Update order status to PAID
- Generate tickets

---

## Environment Variables

### Backend
```properties
# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# MercadoPago
MERCADOPAGO_ACCESS_TOKEN=TEST-xxx
MERCADOPAGO_PUBLIC_KEY=TEST-xxx
```

### Frontend
```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxx
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/payments/create-intent` | Create payment intent |
| POST | `/payments/confirm` | Confirm payment |
| GET | `/payments/{id}/status` | Get payment status |
| POST | `/webhooks/stripe` | Stripe webhook |
| POST | `/webhooks/mercadopago` | MercadoPago webhook |

---

## Backend Implementation

### Domain Layer
- `Payment` entity (id, orderId, provider, amount, status, externalId)
- `PaymentStatus` enum (PENDING, PROCESSING, COMPLETED, FAILED, REFUNDED)
- `PaymentProvider` enum (STRIPE, MERCADOPAGO)

### Port Layer
- `PaymentGatewayPort` interface
- `CreatePaymentCommand`
- `PaymentResult`

### Adapter Layer
- `StripePaymentAdapter`
- `MercadoPagoPaymentAdapter`
- `PaymentController`
- `WebhookController`

---

## Frontend Implementation

### Components
- `PaymentModal` - Select payment method
- `StripeCheckout` - Stripe Elements integration
- `MercadoPagoCheckout` - MP Brick integration

### Hooks
- `useCreatePayment()` - Create payment intent
- `usePaymentStatus()` - Poll payment status

---

## Security Considerations

1. **Webhook Verification** - Validate signatures
2. **Idempotency** - Prevent double charges
3. **PCI Compliance** - Never handle raw card data
4. **HTTPS Only** - All payment endpoints
5. **Logging** - Audit trail for transactions

---

## Testing

### Test Cards (Stripe)
| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |

### Test Cards (MercadoPago)
| Card | Result |
|------|--------|
| 5031 7557 3453 0604 | Success (Mastercard) |
| 4509 9535 6623 3704 | Success (Visa) |

---

## References

- [Stripe Docs](https://stripe.com/docs)
- [MercadoPago Docs](https://www.mercadopago.com.pe/developers)

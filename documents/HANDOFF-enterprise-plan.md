# HANDOFF: Enterprise Plan + Sidebar Add-ons

## Catalog (Supabase)

Migration: `supabase/migrations/20260719120000_enterprise_plan_catalog.sql`

| Field | Value |
|-------|-------|
| `name` | Enterprise Plan |
| `base_price_per_member` | 0 |
| `is_custom` | true |
| `is_active` | true |
| `max_members` | NULL (UI shows **101+ member**) |

- Module access copied from **Scale Up Plan**
- Add-ons linked explicitly: `omnichannel_roster`, `lead_magnet` (Enterprise has `base_price = 0` so automatic paid-plan junctions skip it)
- Features include `101+ Member Allowed`, `Modul kustom`, enabled modules, `Dashboard selalu aktif`

## Office UI (`/subscription/plans`)

- **Sidebar** (col-span-3): title **Add-ons**; `PlanAddOnsPanel` for **current plan** with catalog add-ons
- **Plan grid**: 3 cards (Start Up, Scale Up, Enterprise) — no adjacent add-on column
- **Enterprise card**: custom pricing hero, no slider/billing/checkout; CTA **Hubungi Sales** → WhatsApp `6281118891308`
- Enterprise excluded from onboarding self-serve (`is_custom` in `planSelectable`)

## CMS (synckerja-web)

- Same migration mirrored under `synckerja-web/supabase/migrations/`
- Edit plan copy/modules at `/admin/pricing` after migration runs
- Optional: expose `is_custom` in `EditPlanPricingSheet` for future sales-led tiers

## Sort order

`sortSubscriptionPlansForDisplay`: trial/free → paid by price → Scale Up → Enterprise last.

## Constants

```ts
ENTERPRISE_SALES_WHATSAPP = "6281118891308"
buildEnterpriseSalesWhatsAppUrl(message)
```

# PRD-00 — Vision & Principles

## The user
Bowie, age 10. Obsessed with Minecraft. Has allowance and birthday money but no clear sense of what a fair price is or where to buy something. Currently asks his dad to "look it up on Amazon" — picks the first result, sometimes overpays, sometimes misses a better deal at Target or Lego.com.

Not other kids. Not parents. Not adults. One user, one device, one obsession. We expand later.

## The promise
**Type a thing. See where it's cheapest, fastest, and closest. Tap to open. Done.**

No login. No cart. No checkout. No social. No "for you" feed. No streaks. No badges to collect. The app is a tool, not a destination.

## Why this exists
Rork's original brief was the right one and got lost: a minimalist, one-screen way to compare prices across stores for *any* product. The grocery-era code on `archive/grocery-era` is a different product. This document marks the reset.

Starting scope: **Minecraft products only.** Narrow enough to seed real data by hand. Broad enough (Lego sets, plushies, figures, apparel, the games themselves, books, server gift cards) that a kid will use it more than once a week. Once Minecraft feels right, expand category by category.

## Principles

1. **One screen does the job.** Home is the product. Everything else is a detail view or a sheet.
2. **Lazy beats thorough.** If a feature requires the kid to think, configure, or remember something, it's wrong. Defaults over settings.
3. **Show, don't filter.** No category pickers, no store toggles, no preferences screens on v1. The ranking does the work.
4. **Real prices or no prices.** Mock data is a development scaffold, not a shipping product. Until a retailer's price for an item is real and current, that retailer doesn't appear in results for that item.
5. **The app never spends money.** Tapping an offer opens the retailer's page in the system browser. Dad makes the call from there.
6. **No tracking, no ads, no analytics SDKs.** Not because of any regulation, because it's a kid's app and we don't need them.
7. **No accounts.** Wishlist and alerts are device-local. If the device wipes, the wishlist wipes. That's fine.

## In scope (v1)
- Home screen with search, ranked offer cards, badges (Best Value / Fastest / Closest)
- Product detail with store-by-store breakdown, save to wishlist, alert me when it drops, send to parent
- Wishlist as a pull-up sheet from home
- On-open price alert check (compare current prices to saved targets, fire local notification)
- Send-to-parent share sheet (system share — iMessage, AirDrop, etc.)
- Curated Minecraft catalog (~50 items) with hand-snapshotted prices across Amazon, Target, Walmart, Lego.com, Best Buy, GameStop

## Explicitly out of scope (v1)
- Authentication, accounts, sync across devices
- In-app checkout or affiliate redirects with friction
- Live retailer APIs (phase 2)
- Categories beyond Minecraft (phase 3)
- Crowdsourced prices, receipt scanning
- Multi-item basket optimization
- Price history charts (need real data over time first)
- iPad-specific layouts, Android, web

## Kid safety posture
- No search result for "minecraft" surfaces an adult product. Catalog is hand-curated; phase-2 live data goes through a category allowlist.
- No personal information collected, transmitted, or stored. Wishlist is `AsyncStorage`-local.
- No third-party SDKs that phone home (no Firebase Analytics, no Sentry without a privacy review, no ad networks).
- App is not COPPA-certified — we sidestep COPPA by collecting nothing. If we ever need to add anything that collects data from a child, we revisit.
- Send-to-parent is the only "share with another person" affordance. It uses the OS share sheet; we don't operate a backend.

## Success criteria (v1)
- Bowie uses it without help to find a Lego set across 3+ retailers
- He sets a price alert on something he's saving up for, gets notified when it drops
- He sends a deal to dad via iMessage from product detail
- Nothing in the app asks him to "sign up," "rate us," or "upgrade"

## What kills v1
- Stale or wrong prices (the bug that killed Basket)
- Any moment where the kid has to read a setting to understand a result
- Any tap that opens a screen with more than one primary action

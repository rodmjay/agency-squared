# AgencyPro site: iteration log

One improvement per round. Each round passes lint, build, a desktop and 375px check, keyboard basics, a URL round-trip when
it touches URL state, and a privacy check before it publishes.

| Date | What | Why | Result |
|---|---|---|---|
| 2026-11-16 | Rebuilt on Next.js; Material Web (Material 3) with a green scheme | Asked for something new and fun; no purple, nothing that looks generic | Shipped in the first publish |
| 2026-11-16 | Round 1: "Send this split" shareable link that opens as a payout receipt, plus link previews | Turns the calculator into something an agency hands to its contractors and partners | Shipped in the first publish |
| 2026-11-16 | Payout model: pending until the payment fully clears; it clears (everyone paid) or it doesn't (no one paid, nothing owed). No clawbacks; "you'll never have to pay it back" | Product decision on the payout model | Shipped in the first publish |
| 2026-11-16 | Round 2: the hero card replays one payment: invoice sent, client paid (every share striped as Pending), then Cleared, with shares flipping to Paid one by one; Replay button; static when motion is reduced | Explains the pending-until-cleared model in about five seconds, before anyone touches the calculator. Also fixed: a plain visit with an unrelated query string no longer gets rewritten | Committed; publishes with the next allowed window |

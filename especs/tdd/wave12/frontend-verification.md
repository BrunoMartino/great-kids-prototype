# Wave 12 frontend verification

Browser on docker `localhost:3000` (Preview B).

| Criterion | Result |
|-----------|--------|
| Phone outer frame fits 100dvh + width | Pass — scaled iPhone chrome centered on aqua desk |
| Inner screen still scrolls | Pass — `/child` content scrolls inside bezel |
| prefers-reduced-motion: no scale animation | Code: PhoneScale has no transition; reduced-motion kills drawer motion |
| Hamburger top-right inside bezel | Pass |
| Drawer items: quiz, calendar, forecast, surprise, cycle, diary | Pass |
| Footer: Perfil, Plano, Sair | Pass |
| Ver como criança → `/child` | Pass |
| Child drawer has no plan/invite/quiz/calendar/forecast | Pass (Casa da criança + Sair) |
| `/child` shows chosen + history + add note | Pass (chosen: Living room fort; history blocked by API 403; note composer present; no photo) |
| Copy Alterar plano / Convidar familiar | Pass on `/plan` |
| No family/mission id prompts | Pass on `/quiz`, `/calendar`, `/diary`, `/plan`, `/child` |
| Tokens no longer terracotta/cream | Pass — coral `#ff5a36`, sky paper `#f3f8ff`, aqua desk `#b8e4f0` on family and panel |

Manual still: Safari / Firefox / iOS device; file-picker unrelated.

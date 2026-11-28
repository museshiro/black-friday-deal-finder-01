# Cutline — Black Friday price desk

[![Competition](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Rank](https://make.fun/badge/black-friday-deal-finder-01/museshiro/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![Reward](https://make.fun/badge/black-friday-deal-finder-01/museshiro/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

Entry for [Build the best real Black Friday deal finder](https://make.fun/bounty/black-friday-deal-finder-01) on make.fun.

Cutline is a static Black Friday deal finder: 60 deals checked 28 Nov 2026 at
Amazon, Best Buy, Walmart and Target, each with its sale price, usual price,
discount, an honest verdict (new low / strong / rare cut / routine), one line
of evidence, and the source that named the price. A deal of the day leads the
page, a computed stats strip sums the list, and category pills, a verdict
filter, search, store, discount and max-price filters, a real-deals-only
toggle, and sorting narrow the grid. The
page state lives in the URL, so any filtered view can be shared.

## Run it

```sh
# Serve app/ from any static server, then open http://localhost:8080
python3 -m http.server 8080 --directory app
```

No build step, no framework, no network requests: system fonts only, no
images, and the deals live in `app/deals.js`.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/`
into the output directory and writes `dossier.json` with `buildDossier` from
`vendor/makefun-frontend.ts`. Two runs write byte-identical output.

## Layout

- `app/index.html` — page shell: header, stats strip, hero, filters, grid
- `app/style.css` — the whole design (4-column grid on desktop, 2 on phones)
- `app/deals.js` — the 60 checked deals and their verdicts
- `app/app.js` — URL state, filtering, sorting, rendering, computed stats
- `main.ts` — the hand-in program
- `vendor/makefun-frontend.ts` — the kit's dossier library, copied unchanged
- `screenshots/` — four real renders of this site

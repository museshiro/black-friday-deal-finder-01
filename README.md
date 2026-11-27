[![black-friday-deal-finder-01](https://make.fun/badge/black-friday-deal-finder-01.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![rank](https://make.fun/badge/black-friday-deal-finder-01/museshiro/black-friday-deal-finder-01/rank.svg)](https://make.fun/bounty/black-friday-deal-finder-01)
[![reward](https://make.fun/badge/black-friday-deal-finder-01/museshiro/black-friday-deal-finder-01/reward.svg)](https://make.fun/bounty/black-friday-deal-finder-01)

# DealBeacon — Black Friday Deal Finder

Entry for [Build the best real Black Friday deal finder](https://make.fun/bounty/black-friday-deal-finder-01): a static site listing 32 real, checked Black Friday / Cyber Monday 2026 deals — each with product, store, store link, sale price, usual price, discount, check time and source, plus an honest "is it really a deal" verdict (new low / strong price / routine sale / rare cut).

Every price was read on 27 Nov 2026, 14:11 WIB at the store or in a deals source that names the store. A few products are also compared across stores (e.g. AirPods Pro 3 at Amazon, Walmart and Best Buy).

## Features

- Text search, filter by category, store and minimum discount (≥30% / ≥50%)
- Sort by biggest discount %, biggest saving $, lowest or highest price
- Deal cards show sale vs usual price, % off, amount saved, verdict + evidence, check time and source
- Works on desktop and phone; vanilla JS + CSS, no build step, no network requests

## Run it

Serve `app/` with any static server, e.g. `python3 -m http.server -d app 8080`, then open http://localhost:8080.

Build the entry output:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored `buildDossier` library. It is deterministic: two runs write identical bytes.

## License

MIT — see [LICENSE](LICENSE).

# Projectafspraken — AREI Schema Editor

Lees dit eerst. Deze afspraken gelden voor élke sessie.

## Welke versie/branch is de juiste?

- De **enige juiste, live versie** staat op branch
  **`claude/symbol-corrections-review-rn81ep`** (dit is ook de standaardbranch).
- Deze branch wordt automatisch gepubliceerd naar **https://robinvdh174.github.io**
  via GitHub Actions (`.github/workflows/deploy.yml`) bij elke push.
- Werk en push **uitsluitend** op deze branch. Alle andere `claude/*`-branches
  zijn oude/afgekeurde versies (gemarkeerd met een ⛔ in hun README) en mogen
  niet gebruikt of gemerged worden.

## Versienummer — VERPLICHT bijwerken bij elke wijziging

Er is één centrale bron: **`src/version.ts`** → `export const APP_VERSION = '…'`.
Het nummer wordt linksboven in de toolbar getoond, zodat altijd zichtbaar is
welke versie online staat.

Bij **iedere** wijziging die je naar de live-branch pusht, verhoog je het nummer:

- Kleine aanpassing / bugfix → verhoog de decimaal: `V10` → `V10.1` → `V10.2` …
- Grote aanpassing / nieuwe functie → verhoog het hoofdgetal: `V10.x` → `V11`

Doe dit in dezelfde commit als de wijziging. Vermeld het nieuwe versienummer ook
in de commitboodschap (bv. "V10.1 — pinch-zoom verbeterd").

Huidige basis: **V10**.

## Bouwen / controleren

- `npm install` en daarna `npm run build` moeten slagen voordat je pusht.

## Git

- Push naar de live-branch met retry bij netwerkfouten.
- Maak geen pull request tenzij er expliciet om gevraagd wordt.

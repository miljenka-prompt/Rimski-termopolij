# Eumachus — Andautonija WebAR

Mobilno WebAR iskustvo o kompozitnom heleniziranom Tračaninu i libertinu u
rimskoj Andautoniji. Projekt koristi šest narativnih prizora, kvalitativni
evidencijski sloj i opacity kao urednički signal — ne kao lažnu brojčanu
vjerojatnost.

## Pokretanje

Projekt je statičan i namijenjen GitHub Pagesu. Otvorite `index.html` preko
HTTPS poslužitelja. Na kompatibilnom Android uređaju gumb **Postavi u prostor**
pokreće WebXR hit-test; svi ostali uređaji dobivaju rotirajuću 3D dioramu.

## Struktura

- `src/experience.js` — stanje prizora, jezik, zvuk i kontrole
- `src/diorama.js` — Three.js scena, model, opacity i WebXR postavljanje
- `src/chronovisor.js` — ulazak u interpretativni vizualni sloj
- `src/content.js` — hrvatski i engleski tekst te evidencijske oznake
- `legacy/` — sačuvani izvorni Hiro-marker demo

Aktivni razvoj odvija se na grani `eumachus-v2`. `main` ostaje javna stabilna
verzija do korisničkog odobrenja.

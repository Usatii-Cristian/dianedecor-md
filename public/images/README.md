# Imagini

Toate fișierele din acest folder sunt **placeholder-e generate automat** (tonuri
mate, cu wordmark-ul studioului peste). Se înlocuiesc 1:1 cu fotografiile reale,
păstrând exact același nume de fișier — nu trebuie modificat niciun cod.

Regenerare placeholder-e (dacă adaugi un proiect nou în `src/lib/content.js`):

    node scripts/generate-placeholders.js

## Convenție de denumire

### `portfolio/`

Pentru fiecare proiect, `<slug>` este slug-ul din `src/lib/content.js`:

| Fișier | Rol | Raport | Dimensiune recomandată |
|---|---|---|---|
| `<slug>-cover.jpg` | coperta din grila de portofoliu și din card-uri | 4:5 (portret) | 1200 × 1500 |
| `<slug>-01.jpg` … `<slug>-0N.jpg` | galeria din pagina proiectului | 4:5 sau 3:2 | 1200 × 1500 / 1600 × 1067 |

Numărul de imagini din galerie este dat de `imageCount` în `src/lib/content.js`.
Dacă adaugi mai multe poze, crește `imageCount` și rulează din nou seed-ul.

### `services/`

Câte o imagine per serviciu: `<slug>.jpg`, raport 3:2, recomandat 1600 × 1067.

### Imagini generale

| Fișier | Unde apare | Raport | Recomandat |
|---|---|---|---|
| `hero.jpg` | fundalul hero-ului de pe pagina principală | 3:2, peisaj | 2400 × 1600 |
| `despre-fondator.jpg` | portretul din `/despre` și blocul de intro de pe homepage | 4:5 | 1200 × 1500 |
| `atelier.jpg` | secțiunea de valori din `/despre` | 4:5 | 1200 × 1500 |
| `og-image.jpg` | previzualizarea la partajare pe rețele sociale | 1.91:1 | 1200 × 630 |

## Recomandări

- JPG, calitate 80–85, sub 500 KB per fișier. `next/image` face restul.
- Fotografii pe orizontală pentru hero, pe verticală pentru coperțile de proiect.
- Nu pune text în imagini — textul se adaugă în cod, ca să rămână selectabil și indexabil.

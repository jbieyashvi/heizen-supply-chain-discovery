# Axiforma (brand typeface) — licensed font drop-in

Heizen's brand typeface is **Axiforma**. Licensed font files are **not** included
in this repository (they must not be committed without a valid licence).

The app already references `"Axiforma"` first in its font stack
(`--font` in `src/styles/global.css`) and falls back to Inter → Avenir Next →
system. No component changes are needed to activate the real typeface — just add
the files and the `@font-face` rules.

## To activate Axiforma

1. Place the licensed **.woff2** (preferred) files in this folder, e.g.:

   ```
   public/fonts/Axiforma-Regular.woff2   (400)
   public/fonts/Axiforma-Medium.woff2    (500)
   public/fonts/Axiforma-SemiBold.woff2  (600)
   public/fonts/Axiforma-Bold.woff2      (700)
   ```

2. Uncomment the `@font-face` block at the top of
   `src/styles/global.css`. It already uses `font-display: swap` and maps the
   four weights above. Because these live in `/public`, Vite serves them at the
   site root and the base-path build handles them automatically.

3. Rebuild. The UI will pick up Axiforma everywhere via the `--font` token.

Do **not** download or embed an unlicensed copy of Axiforma. Until licensed
files are added, the Inter fallback keeps the product readable and on-scale.

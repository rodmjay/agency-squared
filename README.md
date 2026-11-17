# AgencyPro

The AgencyPro home page: Next.js with Google's Material Web components on our design system
(Material 3, brand `agency`), exported as a static site and served by GitHub Pages.

    npm install
    npm run dev          # local preview
    npm run build        # checks English/Spanish, then a static export to out/
    npm run check:i18n   # the dictionary check on its own (also a pre-push hook)
    npm run sync:ds      # copy the built design system into src/design-system (stripped; needs DS_DIR)

## English and Spanish

Every word on the page is in `src/i18n/en.json` and `src/i18n/es.json` (neutral Latin American Spanish, *usted*).
Components hold no copy. `/` is English and `/es/` is Spanish, each a static page with its own `lang`.
A small script before paint sends visitors to their language (`?lang=`, their menu choice, the browser, the
time zone); the menu in the header switches and remembers. The build fails if the two dictionaries differ.

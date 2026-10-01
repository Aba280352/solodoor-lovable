# SOLODOOR — homepage (Lovable-ready)

React port of the Claude Design homepage in `../claude-design-source/`
(`SOLODOOR Standalone Source.dc.html`). Written for Lovable's current template:
TanStack Start, React 19, TypeScript, Tailwind v4, shadcn/ui, `@/` alias.

Nothing here has been pushed to Lovable. This folder is a local preview harness
around the files that are meant to be carried over.

## Run locally

```bash
npm install
npm run dev
```

`npm run assets` regenerates `public/images`, `public/fonts` and
`src/components/solodoor/icon-data.ts` from `../claude-design-source/`.

## What goes into the Lovable project

| Path | Notes |
| --- | --- |
| `src/styles.css` | Design tokens (oklch), fonts, keyframes, the `fs-*` utility and the fluid root scale. Replaces the template's `styles.css`. |
| `src/lib/utils.ts` | `cn()` with one addition: tailwind-merge is taught the `fs-*` utility. |
| `src/components/ui/{button,dialog,input,textarea}.tsx` | shadcn primitives restyled for the brand. |
| `src/components/solodoor/*` | One file per section, plus `data.ts` (all copy and image paths) and `Icon.tsx` + `icon-data.ts` (the brand's magicoon icons). |
| `src/hooks/*` | Scroll reveal, eased wheel scrolling, viewport scale. |
| `src/routes/index.tsx` | The page itself, already a `createFileRoute("/")` route with `head` meta. |
| `public/images`, `public/fonts` | 75 optimised WebP images (5.6 MB), the logo, Discovery Fs. |

Local-only, do not carry over: `vite.config.ts`, `index.html`, `src/main.tsx`,
`src/routes/__root.tsx`, `src/routeTree.gen.ts`, `scripts/`. In Lovable keep the
template's own `__root.tsx` and make sure it renders `<html lang="he" dir="rtl">`.

## Conventions worth knowing

- **Fluid scale.** The design is a 1440px artboard that scales with the window.
  From `lg` up, `html { font-size: width / 90 }`, so `1rem` = 16 design pixels at
  any width and every size is written in rem (Tailwind spacing: design px ÷ 4,
  e.g. 48px → `px-12`). Below `lg` the root is 16px and the mobile layout applies.
- **`fs-<n>`** sets the font size in design pixels (`fs-62`). It does not touch
  line height; text keeps the body's 1.6 unless a `leading-*` class is present.
- **Colours** are tokens only: `primary` = clay `#D7978B`, `secondary` = sage
  `#7D958B`, `foreground` = ink `#131313`, `background` = `#FAFAFA`,
  `card` = `#FFFFFF`, `border` = `#E3E3E3`, `muted` = sand `#F4F2EF`.
- **Mobile layout** (below 1024px) is an adaptation: the source design is
  desktop-only.
- All links are `href="#"` placeholders and the two forms do not submit anywhere yet.

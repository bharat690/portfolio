# Bharat Rai — Systems of Intent

A single-screen, interactive Three.js portfolio built with React Three Fiber.
The hero figure is reconstructed from high-resolution, transparent layers
derived from `reference/bharat_ghost.png`, which remains unchanged. Those
layers are curved, subdivided Three.js relief meshes with a separately rigged
head and cursor-tracked pupils. The five navigational artifacts are modeled
procedurally in the project; no external 3D models are required.

## Run locally

```sh
npm install
npm run dev
```

Create a production build with `npm run build`.

## Portfolio content

Edit `src/data/portfolio.ts` to add projects, technologies, achievements,
education, and contact details. Empty detail collections are deliberate until
real information is supplied; the interface labels missing details rather than
inventing portfolio claims.

## Structure

- `src/scene/character/` — reference-textured head/body layers and cursor attention
- `public/character/` — transparent, source-resolution head and upper-body textures
- `src/scene/artifacts/` — independently modeled medal, badge, magazine, knife, and radio
- `src/scene/PortfolioScene.tsx` — camera, responsive composition, and scene state wiring
- `src/ui/` — persistent navigation and non-scrolling HTML HUD
- `src/styles/` — fixed viewport, responsive layout, and reduced-motion styling

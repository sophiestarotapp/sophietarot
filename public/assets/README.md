# Asset Architecture

All visual/audio assets are organized into **independent systems** — Sophie is
never baked into a background. Each layer can be swapped without touching the
others (Live2D / Spine / 3D ready).

```
/assets
  /environments   tarot_room, moon_observatory, garden, winter_cabin, castle_library
  /sophie         classic, witch, princess, academy, winter, summer, ...
  /props          table, crystal_ball, candles, flowers, books
  /effects        sparkles, moonlight, snow, petals
  /audio          music and SFX (page turns, card flips, chimes)
```

## Runtime layer mapping (current build)

| Layer | Component | Notes |
| --- | --- | --- |
| Environment | `src/components/environment/EnvironmentLayer.tsx` | sky, light, day-night, seasons |
| Props | `src/components/environment/PropsLayer.tsx` | interactive room objects |
| Particles/Effects | `src/components/effects/EffectsLayer.tsx` | sparkles, weather |
| Character | `src/components/sophie/Sophie.tsx` | layered SVG; swap point for Live2D |
| UI | pages + `src/components/home/*` | HUD, panels, navigation |

## Live2D preparation

`Sophie.tsx` already exposes the rigging surface required by the character
generation system: blink, smile/emotions (12 states), head movement, breathing,
hair physics, bow physics, eye tracking. When a Live2D/Spine model lands in
`/assets/sophie/<style>/`, replace the SVG internals of the `Sophie` component —
its props (`emotion`, `styleId`, `size`) are the integration contract.

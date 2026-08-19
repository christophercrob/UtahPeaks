# Utah Mountain Ranges & Highest Peaks — Design Brief

## Chosen Approach: Topographic Field Guide

**Design Movement:** National Park / USGS Cartographic — earthy, authoritative, expedition-ready

**Core Principles:**
1. The map is the hero — full-viewport, always visible, zero chrome overhead
2. Earthy, muted palette drawn from Utah's geology: sandstone, slate, sage, snow
3. Information reveals on demand — clean surface, rich detail on interaction
4. Feels like a printed topo map brought to life digitally

**Color Philosophy:**
- Background: deep slate `#1C2333` (night sky over the desert)
- Header/panels: warm off-white `#F5F0E8` (aged paper / topo map stock)
- Accent: burnt sienna `#C0522A` (Utah red rock)
- Text: charcoal `#2D2D2D` on light, near-white `#EEE8DC` on dark
- Range colors: distinct, desaturated earth tones — no neon

**Layout Paradigm:** Full-bleed map with a slim fixed header bar and a floating sidebar panel that slides in when a peak is selected. The map occupies 100% of the viewport at all times.

**Signature Elements:**
1. Slim topographic-contour texture in the header background
2. Small SVG teardrop pins in red with white center dot
3. Colored translucent range polygons with bold range-name labels

**Typography System:**
- Display: "Playfair Display" (serif) — for the site title, peak names in popups
- Body: "Source Sans 3" (sans-serif) — for data labels, legend, UI chrome

**Brand Essence:** A cartographer's digital field guide to Utah's mountain ranges — for hikers, geographers, and curious explorers.
**Brand Voice:** Precise, confident, quietly reverent of the landscape. Headlines are declarative ("Kings Peak — 13,528 ft"). No fluff.

## Style Decisions
- Map fills 100vh; header is fixed at top, ~56px tall
- Sidebar panel floats over the map on the right, triggered by pin click
- Legend is a compact floating card, bottom-left
- Layer switcher (Topo / Satellite / Street) is a compact toggle top-right of map

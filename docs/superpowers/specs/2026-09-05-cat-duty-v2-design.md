# Cat Duty V2 Design

## Goal

Replace the current cartoon cat sprite animations with new photorealistic cat artwork while preserving the existing duty rotation, information bubble, desktop placement, and two-hour action rotation.

The three supplied references map as follows:

- Image 1, pink collar: 甜枣
- Image 2, blue collar and colorpoint coat: 三塔 (Santa)
- Image 3, tabby cat inside a beige circle: 雪宝

## Scope

This change covers:

- Preparing one transparent master image for each cat.
- Generating four transparent sprite sheets for each cat.
- Updating the cat configuration to describe actions explicitly.
- Updating the sprite renderer to support metadata-driven sheets.
- Adding static fallbacks and reduced-motion behavior.

This change does not alter:

- Daily duty-cat selection.
- Date, lunar calendar, role, birthday, personality, or quote content.
- The information bubble layout and visual style.
- Desktop positioning.
- The current rule that hides Cat Duty below 768px.

## Visual Direction

The new cats must remain photorealistic and recognizable across every frame. The following details are identity locks:

- 甜枣: brown and white coat, blue eyes, pink collar, pink paw medallion.
- 三塔: cream colorpoint coat, dark face and legs, blue eyes, blue collar, blue paw medallion.
- 雪宝: warm tabby markings, pale chest, blue collar, gold-edged blue paw medallion.

All generated assets use:

- Transparent backgrounds.
- Centered full-body framing.
- A consistent ground line and scale.
- Soft neutral studio lighting.
- No text, scenery, borders, circles, or decorative backgrounds.
- No anatomy changes, added limbs, collar changes, or medallion changes.

The beige circle and dark outline in 雪宝's reference are removed when creating the master image.

## Action Matrix

### 甜枣

1. Gentle paw wave with a blink.
2. Calm breathing with occasional blinking.
3. Slow yawn, then return to the neutral pose.
4. Seated tail sway with a small head movement.

### 三塔

1. Raised paw gesture with a blink.
2. Alert head turn, then return to center.
3. Slow yawn, then return to the neutral pose.
4. Playful standing sway, then sit back down.

### 雪宝

1. Paw wave with a blink.
2. Yawn and front-leg stretch.
3. Small excited hop, then settle into the neutral pose.
4. Type on a compact keyboard, then look back at the viewer.

Each loop starts and ends close to the same neutral pose so repeated playback does not jump visibly.

## Asset Format

New files live under versioned paths so the current assets remain available for rollback:

```text
public/assets/cats/v2/
  tianzao.png
  santa.png
  xuebao.png

public/videos/cats/v2/
  tianzao/
    wave.png
    idle.png
    yawn.png
    tail.png
  santa/
    gesture.png
    look.png
    yawn.png
    sway.png
  xuebao/
    wave.png
    stretch.png
    hop.png
    typing.png
```

Each action asset is a `4 x 4` sprite sheet with 16 frames ordered left-to-right and top-to-bottom. Every cell is square. The sheet has no outer padding or gutters beyond the transparent space inside each cell.

The intended playback rate is action-specific, generally 6-10 frames per second. Subtle actions use slower playback than hops or waves.

## Component Design

### Cat configuration

Each cat receives:

- `image`: static V2 fallback path.
- `actions`: an array of action descriptors.
- Existing identity and quote fields.

Each action descriptor contains:

```js
{
  id: 'wave',
  src: '/videos/cats/v2/tianzao/wave.png',
  columns: 4,
  rows: 4,
  frameCount: 16,
  fps: 8,
}
```

`getDutyCat()` continues using the current two-hour block calculation and selects an action with modulo arithmetic. The selected action replaces the current raw sprite string.

### Sprite renderer

`SpriteAnimation` changes from a fixed `200 x 200` source-cell assumption to metadata-driven source rectangles:

- Source frame width is `image.width / columns`.
- Source frame height is `image.height / rows`.
- Frames are read left-to-right and top-to-bottom.
- The destination canvas remains `200 x 200`.
- `object-fit` behavior is reproduced by drawing the full square source cell into the square destination.

The renderer does not scan pixels to discover frames. The manifest is authoritative, which avoids expensive `getImageData()` calls and makes generated sheet dimensions independent from display size.

### Loading and failure states

- Before the action sheet loads, show the cat's transparent static master image.
- If the action sheet fails, keep the static image visible.
- Swap to the canvas only after the first valid frame has been drawn.
- Never show an empty canvas, black rectangle, or white source background.

### Reduced motion

When `prefers-reduced-motion: reduce` is active:

- Do not start the animation loop.
- Display only the static master image.
- Keep the information bubble and all text unchanged.

## Performance

- Only the current duty cat's selected action is requested.
- No other cat or action sheet is eagerly loaded.
- Animation uses `requestAnimationFrame` and cancels it on unmount or action change.
- Canvas dimensions stay at `200 x 200` to avoid unnecessary rendering work.
- Generated PNGs should be losslessly optimized after approval.

## Accessibility

- The decorative cat image remains outside the reading flow and receives an empty alternative description.
- Reduced-motion preference is honored.
- The existing text bubble remains readable and unchanged.
- The mobile-hidden behavior remains unchanged.

## Verification

Implementation is complete when:

1. Each of the three cats is visually consistent with its supplied reference.
2. All 12 action sheets have transparent backgrounds and valid 4 x 4 frame layouts.
3. Every action begins and ends without a visible loop jump.
4. Daily cat rotation and two-hour action rotation still use the existing schedule.
5. A missing sprite sheet displays the correct static cat instead of an empty canvas.
6. Reduced-motion mode displays the correct static cat and does not schedule animation frames.
7. The bubble, desktop position, and mobile visibility match the current component.
8. Lint, targeted tests, and the production build complete successfully.

## Rollback

The existing image and sprite files remain untouched. Rolling back only requires restoring the previous cat configuration and renderer; no asset restoration is necessary.

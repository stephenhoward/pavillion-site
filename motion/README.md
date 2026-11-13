# motion: clips for the pavillion.social home page

Remotion compositions for the two silent clips in the storyboard
`pavillion-social-clips--2026-11-10` (internal).
Separate from the Astro site: own `package.json`; nothing here is imported by
`src/` or the site build. The site serves rendered output from `public/clips/`
(see "Home page (site-embed)" for the commands).

Status (2026-11-11): on the home page. Region 1 is the hero clip
(`src/components/HeroClip.astro`); region 2 is the "Posting an event" scroll-pinned
steps section (`src/components/StepsSection.astro`). The notes below the status
line are the working history from the prototype sessions; "uncommitted", "mock"
and `public/mock/` in them refer to that phase.

Remotion licence: free for individuals, for-profit organisations with up to 3
employees, and non-profits (`node_modules/remotion/LICENSE.md`); larger companies
need a company licence. Pavillion's use relies on the free terms, and the steps
section's Player passes `acknowledgeRemotionLicense` on that basis.

| Composition | Length | What it shows |
|---|---|---|
| `region1-community-calendar` | 16.4 s (492 f) | The Seed Swap joins the town calendar, "What's On in Larkspur Bend" |
| `region2-create-event` | 31.0 s (930 f) | Creating the Seed Swap in the phone-width editor, ending on the garden's own calendar |

Both are 1536×1008 at 30 fps, the aspect of the site's current hero and
"visual break" screenshot slots (2262×1484).

```sh
npm install
npm run studio                                     # scrub in the browser
node scripts/render-preview.mjs                    # low-res MP4 + poster PNG (final frame) into out/
node scripts/render-preview.mjs region2-create-event
npx tsc --noEmit -p .                              # typecheck
```

### Scroll-pinned test page (region 2)

A standalone page for trying region 2 as a scroll-pinned section: filler text,
then the phone pinned while native scroll drives the clip, then more filler.
Test page only; nothing here goes into the site.

```sh
npm run scroll-proto      # esbuild (watching) + static server on 0.0.0.0:5179; prints the LAN URLs
```

- **Files:** `scroll-proto/main.tsx` (page and scroll logic), `steps.ts`
  (step cuts in clip frames, and their lines), `index.html` (styles),
  `serve.mjs` (build + server). The bundle goes to `out/scroll-proto/`.
- **Clip:** `region2-create-event` in `@remotion/player`, cropped to the
  centre 960×1008 (the phone plus room for the add-a-room lens).
- **Pin:** 4 viewport heights of scroll. Each step's share is its length plus
  a hold on its last frame (`HOLD`); the last step gets an extra hold (`TAIL`)
  so the final frame stays pinned before the section scrolls away. No wheel
  or touch handlers: a rAF loop reads the section's position and seeks the
  Player.
- **Variants** (toggle, or `?v=scrub` / `?v=steps`):
  - **Scrub:** the frame follows scroll, forward and back.
  - **Steps:** each step plays once at normal speed, in order, and holds its
    last frame. A playing step finishes even if the reader scrolls on, until
    they are 0.75 viewport heights past its scroll (`?forgive=` to try other
    values); then it jumps to where they are. Scrolling back shows earlier
    steps held.
- **Beside the phone** (below it at phone width): the step's line; a
  "Scroll" cue that fades in 1.5 s after the picture stops moving (not on the
  last step); then the step count and a Skip link to the content after the
  section.
- **Reduced motion** (or `?motion=reduce`): no pin; a plain stack of each
  step's held frame with its line.
- **Tested** in headless Chromium at 1440×900, 390×844 and 375×667 with
  scripted scrolling; no hand testing on a real phone or Safari recorded here.
  In steps, a steady scroll of 150 px/s at 390×844 plays every step; 200 px/s
  cuts one. `.stage` carries a `data-frame` attribute for tests.
- **Known rough edges:** the whole-phone frames are small at 390 px (about
  180 px wide); the clip's background glow shows a faint top edge at phone
  width; Remotion's licence notice logs to the console
  (`acknowledgeRemotionLicense` not set).

`out/` is git-ignored. QuickTime keeps the first copy of a file it opened, so
after re-rendering, close the window or open a copy under a new name
(`out/region2-create-event--preview-pushin.mp4` is such a copy; safe to delete).

### Home page (site-embed)

`site-embed/` ports the region 2 "steps" section (scroll-proto's logic, Skip
link and reduced-motion stack) for the home page: `src/pages/index.astro` uses
`src/components/HeroClip.astro` and `src/components/StepsSection.astro`, with
static files in `public/clips/`. Nothing in `src/` imports from `motion/`.

History: two mock pages were compared (2026-11-11); Mock A (hero buttons removed,
clip in the hero, steps section in place of the "visual break" screenshot) became
the home page. Mock B (steps section directly under the hero, hero buttons kept, a
closing line after the last step) was retired.

```sh
node site-embed/build.mjs            # -> ../public/clips/steps.js (add --watch to rebuild on change)

# hero (from motion/): video, final still, phone close-up still
npx remotion render src/index.ts region1-community-calendar ../public/clips/hero.mp4 \
  --crf=28 --codec=h264 --muted --props='{"background":"#FAFAF9"}'
npx remotion still src/index.ts region1-community-calendar ../public/clips/hero-final.jpg \
  --frame=491 --image-format=jpeg --jpeg-quality=82 --props='{"background":"#FAFAF9"}'
npx remotion still src/index.ts region1-community-calendar out/phone2x.png --frame=491 --scale=2 \
  --props='{"background":"#FAFAF9","phoneOnly":true}'
sips -c 1696 844 --cropOffset 196 1958 out/phone2x.png --out out/phone-crop.png
sips -s format jpeg -s formatOptions 72 out/phone-crop.png --out ../public/clips/hero-final-phone.jpg

# steps section no-JS still: frame 870, cropped to the phone column
npx remotion still src/index.ts region2-create-event out/r2-870.png --frame=870 --props='{"background":"#F5F5F4"}'
sips -c 1008 960 --cropOffset 0 288 out/r2-870.png --out out/r2-crop.png
sips -s format jpeg -s formatOptions 82 out/r2-crop.png --out ../public/clips/steps-end.jpg
```

- The bundle registers the clip's fonts as `'Pavillion App Creato'` (rewritten
  at build time; `src/theme` is untouched), because the site maps Bold.otf to
  700 and the app maps it to 600; the same family name would change the site's
  headings. All four weights load from the site's `/fonts/`; no font URLs are rewritten.
- Static files: Remotion's public dir is the site's `public/` (`remotion.config.ts`,
  `Config.setPublicDir('../public')`), so the repo has one copy of each file: fonts in
  `public/fonts/` (the site's own set, ExtraBold added for the app's 700 weight), event
  photos in `public/clips/images/`. `staticFile()` paths are `fonts/…` and
  `clips/images/…`; in the steps bundle they resolve against the site root, and the
  scroll prototype server serves the same folders. Run Remotion commands from `motion/`.
- The Player sits in an `all: initial` box (`.pvs-iso`) so the site's reset and
  inherited text styles don't reach the clip.
- Backgrounds: both compositions take an optional `background` prop (default
  `STAGE_BG`, the reviewed orange glow on #F5F5F4). The steps embed passes
  `transparent`, so the section's own colour shows through. The hero assets are
  rendered with `--props='{"background":"#FAFAF9"}'` (the hero's stone-50), and
  the hero box has no rounded corners or shadow.
- Hero: `public/clips/hero.mp4` is a full-resolution render (1536×1008, crf 28,
  ~1.5 MB; the mock used a half-scale preview);
  `hero-final.jpg` is frame 491 (455 before the slide-in, 359 before the opening build); `hero-final-phone.jpg` is frame 491 at 2x with
  `"phoneOnly":true` (no desktop window behind the phone), cropped to the phone
  (1x rect 979, 98, 422×848; `sips -c 1696 844 --cropOffset 196 1958`), all on #FAFAF9.
  `HeroClip.astro`'s CROP and zoom transform use the same rect. `steps-end.jpg` (no-JS
  fallback) is frame 870 on a flat #F5F5F4.

### Seed Swap photo (2026-11-10)

`src/ui/SeedSwapArt.tsx` now shows a photo by Jael Rodriguez on Unsplash
(site `public/clips/images/seed-swap.jpg`, 800×1200, from
Unsplash photo `hp6vX7SvrCs`). The illustration is kept as
`SeedSwapIllustration.tsx`. Focal point (0.55, 0.25), the seedling hand-off,
is `SEED_SWAP_FOCAL`; the region 2 focal drag now ends there. A small brand mark
on the glove (about 0.4, 0.57) shows in the editor's centred crop. The old
`out/*--preview.mp4` / `--poster.png` renders still show the illustration.

## Handoff: status (2026-11-10)

The sections below are the working notes for whoever continues.

- (Prototype phase, superseded by the status at the top.) Nothing was committed
  while prototyping; the work lived in a worktree branch of the site repo.
- Previews and posters have been rendered and reviewed by the reviewer.
  Feedback so far, all applied to region 2:
  1. Form filling was too fast to follow → slowed ~1.5× (typing ~2–3×), pauses
     added after each step; length went from 15 s to 24.8 s.
  2. Zoom in → a camera (`CAMERA_BASE` in `src/region2/CreateEvent.tsx`)
     follows the active part of the form at 1.4–1.85×, widening for the
     add-a-room lens (1.4×) and the incoming photo (1.25×).
  3. Start zoomed out → the clip opens on the whole phone (`INTRO_HOLD`), pushes
     in over ~1.1 s before the first tap (`INTRO`), mirroring the pull-out at
     the end. Start and end frames are both the whole phone, so the loop cut
     has no jump in scale.
  4. (2026-11-11) The location beat was too fast for someone new to the app, and the
     add-space sheet jumped between sizes → the beat went from ~6.5 s to ~14 s
     (`LOC_EXTRA` = 258 frames added after it): about 1 s to read each new sheet
     before the next tap, and a held view of the filled-in location before the
     scroll to the photo. The picker and add-space sheet are now one `MorphSheet`
     (`src/ui/Sheets.tsx`) whose height eases over 0.6 s (`MORPH`) into each state
     while its content cross-fades (only the middle block within the add-space
     sheet; the whole content between it and the picker). Each change starts once
     the tap's ripple has faded. The app swaps sheets without growing them; the
     growth is for the video's sake. Camera holds still through the sheet changes.
     Buttons never move: one button row pinned to the sheet's bottom is reused across
     the add-space stages (Cancel, and Save, reading Done while the new space is being
     edited; the app's separate Cancel/Done row inside the editor is left out), and the
     picker's row and the add-space row cross-fade in place. Sheet content is clipped
     16 px above the buttons.
  5. (2026-11-11) Each new thing needs a small dwell for the viewer to realise what
     they're looking at → `DWELLS` holds each landing before acting on it: Location
     before Add Location (+0.8 s, 1.4 s in all), the empty image zone before the
     photo (+0.7 s), Categories and Date & Time before their first taps (+0.5 s
     each), the header before Save Changes (+0.3 s). 33.4 s → 36.1 s.
  6. (2026-11-11) A camera pan started just before the scroll to Date & Time → camera
     moves never lead a scroll: each starts with the scroll it accompanies (Categories,
     Date & Time) or after it lands (photo zoom-out), and the pan up to Save Changes waits
     for the last tap mark to fade. 36.3 s.
  7. (2026-11-11) For presentation, the intermediate sheets are skipped: the add-a-room
     icon opens the New Room or Space form directly (no empty space list), and the
     form's Save closes the sheet with the room on the event (no staged list, no
     return to the picker to pick it). The form's button reads Save throughout. The
     location step went from ~17 s to ~11.7 s; the clip from 36.3 s to 31.0 s
     (`LOC_EXTRA` 100). The app's real flow is in the mismatch list below (3).
- Region 1 (2026-11-10): the opening is closer (camera scale 2.2, was 1.38, framed on
  the photo, time, title and place) and the card sits on the stage background alone;
  the page's white fades in behind it during the first pull-back (`PULL`, frames
  56–100, was 60–96). Day headings no longer paint their own white, which showed as a
  band mid-fade. The header wrapper is `position: relative` so the page-white layer
  doesn't paint over the title. `r1-preview.mp4` and `r1-final.jpg` re-rendered; the
  phone crop is unaffected.
  Ending (2026-11-11): the desktop window spans the frame (72 px side margins, page at
  1.0875x) and the phone (scale 0.94) slides up from below to overlap its lower right,
  running 60 px past the window's bottom; the phone's bottom stays ~78 px clear of the
  frame so its shadow isn't cut. At this width the desktop shows the header and Friday;
  the Seed Swap is on the phone only.
  Category filter (2026-11-11): the desktop header now has the app's "Filter by
  Categories" label and pill row under the search bar (`CalendarHeader` `categories`
  prop; region 1 passes every category its events use, alphabetical; none selected).
  It adds `CATEGORY_FILTER_H` (82 px) above the list. Region 2's phone header doesn't
  pass it yet.
  Opening build (2026-11-11): the clip opens on the whole Seed Swap photo (portrait,
  256×384 page px, camera C00 at 2.3x), which crops down to the card's image box
  (`BUILD.crop`, frames 12–36, `CardBuild.crop`) as the camera pushes in to C0 (3.0x);
  the card then builds around it (`BUILD` in `CommunityCalendar.tsx`,
  `CardBuild` prop on `PublicEventCard`): the white body extends right from the photo
  (38–60), the title types out with a caret (58–74), the time drops in (spring, 74),
  the location pin is revealed from its tip up (86–94) and rocks on its tip from 90
  (damped, ±20°, `pinWobble`: quick swings first, slowing as they die away), the place types out (90–112), then the
  description and categories fade in (116–134) as the camera widens from the card's
  left part (CA, 2.0x) to the whole card (C1, 1.36x); the source band and tag fade in
  last (128–140). Everything after the opening runs `D` = 96 frames later, so the clip
  is 456 frames (15.2 s) and the first pull-back is `PULL` 152–196. The full photo
  shows the glove's small brand mark (about 0.4, 0.57). The final frame is
  unchanged, so `r1-final.jpg` / `r1-final-phone.jpg` weren't re-rendered.
  Empty start + slide-in (2026-11-11, feedback: let the visitor read the hero headline
  before the clip draws the eye): the clip opens on the bare stage, and the whole photo
  slides in from above the frame (`BUILD.slide` 6–36, from 60 px right, 560 px up,
  turned −9°; position eases out, the turn comes out 6 frames later so it squares up as
  it stops), like a print pushed across a table. `P` = 36 frames added ahead of the
  crop (now 48–72), so `E` = 60, `D` = 132, the clip is 492 frames (16.4 s), and the
  final frame is 491. On the site (`HeroClip.astro`) the video has no poster, so the box
  stays empty until it plays; it plays once the visitor has scrolled 24 px and half the
  clip is in view (no timed fallback: it never starts without a scroll). The under-640px zoom to the phone was
  `scale() translate()`, which swooped mid-transition; it is now `translate() scale()`
  (same end state), a straight eased move (checked: the phone's centre stays within
  0.1 px of a straight line).
  Scroll brake (2026-11-11): scrolling down past the point where the clip sits centred
  stops there once (root `overflow: hidden`, smooth settle back from the overshoot) for
  1.2 s, longer while wheel events keep coming, capped at 2 s; it doesn't wait for the
  clip to end. The phone zoom's landing is slower: 1.1 s, `cubic-bezier(0.55, 0, 0.15, 1)`
  (was 0.8 s, `cubic-bezier(0.65, 0, 0.35, 1)`).
  Event photos (2026-11-11): Varsity Basketball and Live Music Friday have Unsplash
  photos (Gene Gallin; Israel Palacio), 1200×800 in the site's `public/clips/images/`, wired through
  `src/ui/EventPhotos.tsx` (credits, focal points) and the `image` field in
  `src/data/larkspur.ts`. Both show a maker's brand mark (the ball's wordmark; a badge
  on the microphone grille). Then Bird Walk (Nicky Jones), Saturday Market (Thomas Le),
  Family Matinee (Erik Mclean), Garden Work Party (Jonathan Kemper; the request named
  the Matinee file twice) and Story Hour (Kimberly Farmer), and Karaoke Wednesday (Ilke Yazgan).
  Work Party also shows in region 2's garden calendar, so `public/mock/images/`,
  `steps.js` and `r2-end.jpg` were refreshed too.
  The previously reviewed `out/*--preview.mp4` files predate this.

## Constraints to keep

- The Pavillion app's source (`pavillion/code`) is **read-only** reference for styles, fonts,
  icons and strings. Never modify it.
- Keep the MPL-2.0 notice on every file derived from the app (tokens, fonts
  loader, icons, the UI recreations). Fonts are Creato Display under SIL OFL
  (the site's `public/fonts/`, with its licence file).
- Only the fictional Larkspur Bend names from the storyboard. Invent no UI the
  app doesn't have. Overlays (tap marks, dashed ring + lens, source tags and
  colour bars) use a deliberately different visual language and must keep
  reading as overlays; source tags fade before region 1's final frame.
- Region 2 never opens the repeat controls. Nothing in either clip invites the
  public to browse or shows following a calendar.
- Remotion is source-available, not open source: free for individuals,
  for-profit organisations with up to 3 employees, and non-profits
  (`node_modules/remotion/LICENSE.md`, v4.0.542; it notes a "slight" change
  coming in 5.0, not reviewed).

## Layout of the code

- `src/theme/` – light-theme tokens and the font loader (from the app).
- `src/icons/` – `DoorPlus` (copied from the app's custom icon) and small inline
  SVGs copied from app components. Other icons are `lucide-react@0.577.0`,
  the same version as the app's `lucide-vue-next`.
- `src/ui/` – simplified recreations: public list view (`PublicCalendar.tsx`),
  event editor (`Editor.tsx`), bottom sheets (`Sheets.tsx`), phone frame,
  placeholder Seed Swap art. Block heights are **fixed constants** so the
  timelines can aim taps at them; if you change a block's height, update the
  matching constant (`CARD`, `IN_CARD`, `PICKER`, `ADD_SPACE`, `CARD_H`, …).
- `src/region1/`, `src/region2/` – the timelines. Each file's header lists the
  beats with times.
- `src/data/larkspur.ts` – all fictional content.
- `src/ContactSheet.tsx` + `dev-r1-contact` / `dev-r2-contact` – grids of frozen
  frames for checking layout without scrubbing. Pick frames with
  `npx remotion still src/index.ts dev-r2-contact out/x.png --props='{"frames":"0,120,240"}'`.
  Not deliverables.

## Guesses (not from the storyboard or verified in the app)

- Times, places other than the library, addresses, descriptions, card
  categories, the garden's categories (Workshops, Swaps, Volunteer Days,
  Kids & Families), timezone (America/Chicago), the date-filter label
  "Nov 20 – Dec 3" (default range not checked). Week shown: Fri 20 – Wed 25
  November 2026.
- Approximate sizes/styling for picker rows, the "Add room or space" button,
  language tabs, and the location card (it has no section card in the app).
- End Date is tapped by hand (unknown whether the app fills it); a tap is shown
  on the room-name field (unknown whether it autofocuses); upload
  progress/success overlay skipped; light theme only; device and browser
  chrome are plain and unbranded.
- Event photos are Unsplash stock (credits in `src/ui/EventPhotos.tsx` and
  `src/ui/SeedSwapArt.tsx`), standing in for organisers' own photos.

## Storyboard vs. the real app

1. Location line is "Place — Space" with an em dash (`places.format.with_space`),
   not "·".
2. Editor order is Categories → Series → Date & Time; the storyboard puts date
   before categories. Built in app order.
3. The door-with-plus icon is on each place row in the location picker, before
   a place is chosen. Adding a room is: picker → icon → "Add a space to …" sheet
   → "Add room or space" → New Room or Space (Name) → Done → Save → back in the
   picker, pick "Community Room". App wording is "room or space". The icon does
   not vary by width (storyboard check 2). The clip shortens this to picker →
   icon → New Room or Space → Save (see feedback 7).
4. A new event's header says "Create Event" but the button says "Save Changes".
   The dissolve to the public calendar is the storyboard's device, not app
   behaviour.
5. Card time format is "1:00 PM – 3:00 PM", not "1–3 PM".
6. Public cards do not show an event's source (a `--pav-source-pill-*` token
   exists but no public component uses it), so region 1's tags are overlay only.

## Open items

- Region 2 is 31.0 s against the storyboard's 12–15 s (the reviewer asked for
  the slower pace, twice). Candidate to trim if needed: the 2 s end hold.
- The location step is ~11.7 s of autoplay in the scroll section. Rather than split it
  into two scroll stops, its text changes on its own mid-step: "Let people know where
  to be" then "Down to the room" from clip frame 274 (the add-a-room highlight). A step's
  `more` lines in `scroll-proto/steps.ts` do this; the counter stays on the step,
  and the reduced-motion still stack shows one still per line (`LINES`).
  Revisited (scrolled back to, or reached after it has played), the step holds its last
  frame, so it shows its `held` line instead: "Let people know where to be, down to the
  room" (`TEXTS` = `LINES` + held lines). The lines are bottom-aligned in their shared
  grid cell, since the held line wraps to two lines and would otherwise leave a gap
  above the scroll cue on every step.
- Site steps section copy (2026-11-11): one phrase per step, set at heading
  size, no separate visible heading. `data-heading` is now a screen-reader-only heading
  ("Posting an event"). Lines: Posting an event is quick / Let people know where to be /
  Down to the room / Add a picture / Add categories / Pick the date and time / Save. It's
  on your calendar.
- Final-frame checks against live screenshots of the demo instance (storyboard
  checks 1–3); region 1's waits until the town calendar shows the organisers'
  events.
- Scroll hold on the hero: verified with wheel/trackpad input; still to try with a
  real touch fling in iOS Safari.
- WebM output (the hero ships H.264 MP4 only).
- Several photos show small maker brand marks (the glove, the basketball's wordmark,
  a badge on a microphone grille).
- `src/assets/calendar_screenshot.png` and `app_screenshot.png` in the site are no
  longer used by the home page.
- The site's root `tsconfig.json` now excludes `motion/` (it has its own).

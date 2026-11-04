<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep gender selection at `/`, goal selection at `/next`, and the questionnaire layout at `/continue` with an equipment index and `/continue/$step` children; validate gender and goal search parameters to retain profile choices during navigation.
- Use global semantic tokens and named onboarding classes in `src/styles.css`, with a dedicated Button character variant, so both choices share consistent styling.
- Keep goal definitions and gender-specific illustration mappings in browser-safe library modules; use dedicated Button goal and next variants so all choices share styling and accessible single-selection states.
- Use dedicated goal-only edited transparent cutouts in the goal image mapping, removing white residue including enclosed gaps, so athlete changes never alter questionnaire or plan imagery.
- Frame high-resolution goal-only portraits with contained, bottom-anchored sizing in a dedicated masked image layer with lower-body fade; this preserves hands and equipment without per-image crop hacks or affecting other screens.
- Keep questionnaire definitions and answer validation in a browser-safe module, with shared question rendering and layout-scoped React state; answers never go in URLs, and are persisted only to the signed-in member's owner-only fitness profile (a tab-scoped sessionStorage stash bridges sign-in and is cleared after saving).
- Keep health-choice illustrations in a dedicated browser-safe gender mapping and scope the two-column image-card styling to the health question so other questionnaires retain their layout and validation.
- The questionnaire completion child only shows the simulated preparation, then hands off to sign-in (/auth) or saves via an authenticated server function and opens /dashboard; keep day scheduling in a browser-safe module and do not imply that exercise generation exists.
- Assign illustration assets to distinct screen slots in the browser-safe character pose module; keep day portraits in the separate browser-safe day-portraits mapping so onboarding and goal art stay untouched.
- Frame day-card portraits purely in CSS: each image is height-fitted, anchored to the card's bottom edge and faded into the box colour, so any waist-up portrait added to the day-portraits mapping rises out of the box without per-image frame data.
- Persist day completion through server functions scoped by a server-issued HttpOnly device capability; deny direct Data API access to that table.
- The signed-in dashboard lives under the managed `_authenticated` layout as `/dashboard` (Workout), `/dashboard/recovery`, `/dashboard/community` (view search param) and `/dashboard/me`, sharing one react-query `['account']` load, so each section stays a separate route with one fixed bottom nav.
- Split member data: `profiles` (name/photo, readable by all members, name lock and avatar path enforced by a DB trigger) vs owner-only `fitness_profiles`, so community never exposes body details.
- Community reads/writes use the browser client under RLS with realtime invalidation of `['community']`; replies are messages with `reply_to_id`, likes are a separate table.
- Profile photos live in a private bucket (public buckets are blocked by workspace policy) readable by signed-in members and shown via signed URLs.
- Recovery guidance is a fixed browser-safe formula module (no AI), covered by tests.

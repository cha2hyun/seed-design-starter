# review

Review a pull request, or the current branch if none is named.

Get the diff first: `gh pr diff <number>` for a pull request, otherwise `git diff develop...HEAD`
(or `git diff main...HEAD` when reviewing `develop` itself ahead of a release).
Read the whole thing before writing anything. Then work through the passes below in order — the
early ones catch failures that render silently, which are the expensive ones here.

## 1. Design system

- Any class built from a token outside SEED. `bg-red-500`, `p-4`, `text-lg`, `rounded-md` and
  `max-w-3xl` compile to **nothing**, so the element renders unstyled and no test fails. Check
  suspicious classes against `.seed/tokens.json`.
- Arbitrary values: `p-[12px]`, `text-[#fff]`, `w-[320px]`.
- A new `.css` file, or an import of one. There is exactly one stylesheet.
- Inline `style` without a `// seed-escape: <reason>` comment — and whether the reason holds up.
- New entries in the project `@theme` block of `src/app/styles/global.css`. Verify with
  `get_rootage` that SEED really has no equivalent.
- Text style used as a composition (`text-size-t5 font-bold`) instead of the single class
  (`t5-bold`). Also check the direction: `t1` is 11px and `t14` is 48px, so a heading smaller than
  its body copy usually means the scale was read backwards.

## 2. Architecture

- Import direction: `app → pages → widgets → features → entities → shared`, never upwards or
  sideways between slices.
- Slices reached through `index.ts`, not by deep path.
- Code in the right layer. A business object is an `entity`; something the user does is a
  `feature`; a screen is a `page`.
- Server state in TanStack Query, client state in Zustand, and neither mirrored into the other.

## 3. i18n

- Hardcoded user-facing strings.
- A key added to `ko` but not `en`. This compiles fine and ships Korean to English users.
- Korean copy in the `-요` register, buttons as verbs, errors that say what to do next.

## 4. Generated files

- `@seed-design/*` bumped without regenerating `.seed/tokens.json` and
  `.cursor/rules/_generated-seed-tokens.mdc`.
- Routes changed without `src/app/routeTree.gen.ts`, or that file edited by hand.

## 5. Types and correctness

- `any`, `as never`, or a cast standing in for a fix.
- An `undefined` from array indexing asserted away instead of handled.
- Missing pending / error / empty branches on anything that queries.

## 6. Scope and craft

- Does the diff do one thing.
- Comments that narrate the code or explain the change, rather than recording a constraint.
- Anything a reader would have to reverse-engineer that a comment could have stated.

## Writing it up

Group findings by severity: what must change before merge, what is worth fixing, what is a
suggestion. For each one give the file and line, what is wrong, why it matters here, and the
concrete replacement.

If the diff is clean, say so plainly and name the two or three things you checked most carefully.
Do not manufacture findings to look thorough.

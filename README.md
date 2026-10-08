# Geriatric Care Assessment Form

**Live app:** https://geriatric-care-assessment-form.vercel.app

## Overview

A one-page form a visiting nurse fills in when checking on an elderly patient at home. It has 10 fields,
validates them against the Zod schema from the assignment, simulates a save, and shows the values Zod
returned. All patient data in this repo is invented.

## Tech Stack

- React 19
- TypeScript
- Mantine 9.6 (`@mantine/core`)
- `@mantine/form` (with `schemaResolver`)
- `@mantine/dates` (`DateInput`)
- Dayjs
- Zod 4
- Vitest
- React Testing Library

Built on [mantinedev/vite-template](https://github.com/mantinedev/vite-template), which uses Vite+ (`vp`)
for dev, build, formatting (oxfmt) and linting (oxlint).

## Getting Started

The project pins **Yarn 4.18.1** through the `packageManager` field in `package.json`. A globally installed
Yarn 1 will refuse to run it, so use Corepack (bundled with Node), which picks up the pinned version
automatically. Node 24 is the version in `.node-version`; Node 22 also works.

```bash
corepack enable          # once per machine, so `yarn` resolves to the pinned Yarn 4
corepack yarn install
yarn dev                 # http://localhost:5173
```

If `corepack enable` is not possible (it may need admin rights on Windows), prefix each command with
`corepack`, e.g. `corepack yarn dev`.

## Testing

```bash
yarn test
```

This runs, in order: `vp check` (formatting, oxlint and TypeScript), stylelint, Vitest, and the production
build. `yarn vitest` runs the tests on their own.

There are two tests, one per requirement:

- `schema.test.ts`: with an assessment date of 2026-08-07, a date of birth of 1966-08-07 (60 that day)
  passes and 1966-08-08 (one day short) fails with the error on `dateOfBirth`.
- `AssessmentForm.test.tsx`: renders the form, loads the sample patient, pastes the name with
  surrounding spaces, submits, and asserts `onSave` was called with exactly `sampleAssessment`. The padding
  only disappears if `onSave` receives Zod's parsed output; the test fails if it gets raw form state.

On Windows, run `yarn test` from Git Bash or set `npm_config_script_shell` to a POSIX shell. The template's
stylelint script quotes its glob (`'**/*.css'`), and `cmd.exe` passes those quotes through literally, so
stylelint finds no files. It works as-is on macOS, Linux and in CI.

## Validation Highlights

All rules live in `src/features/assessment/schema.ts`, used exactly as provided:

- The patient must be **60 or older on the assessment date** (not today), so a backdated visit is judged
  on the patient's age at that visit. Turning 60 on the assessment date passes.
- **Barthel Index** is a whole number from **0 to 100 in steps of 5**.
- **5 or more regular medications** (polypharmacy) requires **pharmacist review** to be ticked.
- The **next review date must be after** the assessment date (the same day is rejected).
- **Consent** must be ticked before the assessment can be saved.

## Features

- 10-field assessment form inside a Mantine `Container` → `Paper` with a heading
- Validation through Mantine's `schemaResolver` straight from the Zod schema, on blur and on submit;
  untouched fields stay quiet
- Field-level errors under each input using Mantine's own error rendering, with Zod's exact messages
- Empty submit gives exactly 9 errors (pharmacist review starts unticked, which is valid)
- "Load sample patient" fills the form with the valid fixture and clears any errors on screen
- Simulated async save (~800 ms) with the submit button in its loading/disabled state
- Success `Alert` showing the **parsed** Zod output in a `Code` block

## Deployment

Deployed on Vercel: **https://geriatric-care-assessment-form.vercel.app**

`vercel.json` tells Vercel to run the project's own install and build (`yarn build`) with Yarn 4 through
Corepack. `COREPACK_HOME` is set to `/tmp` in those commands because Vercel's built-in Corepack support
stores Yarn inside the project directory, where this package's `"type": "module"` makes Node load Yarn's
CommonJS bundle as an ES module and crash.

## Project Structure

```
src/features/assessment/
  schema.ts                  Zod schema and MOBILITY list from the brief; exports `Assessment` (z.infer)
  formValues.ts              Form value type derived from z.input<typeof assessmentSchema>, plus empty values
  sampleAssessment.ts        Valid invented fixture, checked with `satisfies Assessment`
  mobilityOptions.ts         Select options generated from MOBILITY
  parseDateInput.ts          Strict date parser for the three DateInputs (see decisions)
  AssessmentForm.tsx         The form: useForm + schemaResolver, fields, submit and success output
  schema.test.ts             Age boundary test (safeParse)
  AssessmentForm.test.tsx    Rendered form test: load sample, submit, onSave gets parsed values
src/pages/Home.page.tsx      Container > Paper > heading > form, and the 800 ms fake save
src/styles.css               Imports Mantine's core and dates stylesheets
```

## Design / Implementation Decisions

- **The schema is the only source of validation rules.** The form uses
  `schemaResolver(assessmentSchema, { sync: true })`; no rule, regex or threshold appears in a component.
  `sync` is used because the schema has no async checks, so errors appear without waiting on a Promise.
- **Types come from the schema.** `Assessment` is `z.infer<typeof assessmentSchema>`. The form's value type
  is a mapped type over `z.input<typeof assessmentSchema>` that widens each field to what its Mantine input
  holds before validation: numbers may be `''`, dates and the Select may be `null`, and `consentObtained` is
  `boolean` so it can start unticked. There is no hand-written interface, `any`, or cast.
- **`onSave` receives Zod's parsed output.** `schemaResolver` only reports errors and discards the parsed
  value, so `useForm` has `transformValues: (values) => assessmentSchema.parse(values)`. Mantine calls it
  only after validation passes, so the parse cannot throw, and the handler is typed as `Assessment`.
- **`clampBehavior="none"` on both NumberInputs.** Mantine's default clamps out-of-range numbers on blur,
  which would silently turn a typed 105 into 100. With clamping off, 105 stays on screen and Zod rejects it.
- **Mobility options are generated from `MOBILITY`.** Labels are made by replacing `_` with spaces and
  capitalising the first letter (`home_visit` → "Home visit"), so a new value appears with no other edit.
- **Dates stay `YYYY-MM-DD` strings** (or `null` when empty) end to end; no `Date` objects in form values.
  The assessment date's `maxDate` is today, formatted with Dayjs.
- **Strict date parsing.** Mantine's `DateInput` parses typed text on every keystroke with a lenient parser
  and keeps any partial result that is within `maxDate`. Typing a future assessment date therefore left
  `0202-01-01` behind (from the partial "202"), and a half-typed `1966-08` became 1966-08-01. The DateInputs
  use `parseDateInput`, which only accepts a complete date as `YYYY-MM-DD` or in the displayed
  `MMMM D, YYYY` format. A typed future assessment date is now refused instead of being rewritten.
- **Saving is injected.** `AssessmentForm` takes `onSave: (assessment: Assessment) => Promise<void>`; the
  page passes the 800 ms fake and the test passes a mock. The loading state is Mantine's own
  `form.submitting`, which stays true until `onSave` settles.
- **Stylesheets are imported from `src/styles.css`.** Removing the template's demo component left the repo
  with no CSS file, which makes the template's stylelint step fail. The Mantine stylesheets the app needs
  are imported from a CSS file instead of from `App.tsx`; the built CSS is identical.

## Scope

Not added, as they are out of scope for the brief: backend, authentication, routing (the template's
single-route router is left as shipped), state libraries, toast notifications, Storybook stories, and
custom styling. The template's demo components and their story/test were removed.

## Time Spent

About 2 hours.

## Unfinished / Notes

Everything the assignment asks for is complete. Remaining notes:

- **When cross-field errors appear.** Zod skips the schema's `.refine()` checks while
  `consentObtained` fails its `z.literal(true)` check, so with consent unticked, a 5-medication entry
  without review shows only the consent error; the polypharmacy error appears once consent is ticked. The
  schema is used as given, so this is left as Zod's behaviour.
- **Blur and cross-field errors.** Blur validation shows the error for the field that lost focus. The
  polypharmacy error belongs to "Pharmacist review requested", so leaving the medication count field does
  not show it; it appears on submit or when the review checkbox loses focus.
- **Bundle size.** The production build warns that the JS chunk is over 500 kB (about 205 kB gzipped),
  mostly Mantine core, dates and form. Code-splitting was not worth it for a one-page form.

## Assignment Decisions / Ambiguities

- **Consent label.** The brief gives the label "Consent" and the checkbox text "Patient or representative
  has given consent". A Mantine `Checkbox` has one label, so it uses the full sentence, which says what is
  being confirmed.
- **"Load sample patient" with errors on screen.** The brief does not say; loading the valid fixture also
  clears existing errors (Mantine's `setValues` does this by default) so a valid form is not shown with
  stale messages.
- **After a successful save** the form keeps its values and the success Alert stays visible, showing what
  was last saved, until the next valid submit replaces it. The brief does not ask for a reset.
- **Typed future assessment dates.** `maxDate = today` is a UI constraint, not a schema rule, so it was not
  added to the schema. A future date typed by hand is refused by the input (see "Strict date parsing").

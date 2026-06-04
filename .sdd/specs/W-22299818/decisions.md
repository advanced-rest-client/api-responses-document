# W-22299818 — Decisions & Root-Cause Correction

## Correction log

### 2026-06-03 — First root cause was wrong (incomplete)

**What I claimed first:** the bug was only in `_computeCodes` / `_statusMatches`,
where the gRPC guard `value === ''` missed the absent-statusCode case. I shipped
that fix (commit `8b19d5c`, PR #44) with "20 tests green".

**Why it was wrong:** the fix never executed. Runtime evidence from the live v6
console (DevTools console probe) showed:

```
isGrpcEndpoint:   false      <-- chain breaks HERE
statusCode value: undefined
_codes:           []
_payload length:  undefined
noDocumentation:  true
```

The gatekeeper `_isGrpcEndpoint` → `_isGrpcOperation` required
`statusCode === ''` to *detect* the endpoint as gRPC. With an absent statusCode
(`undefined`), detection returned `false`, so `isGrpc` was `false` and the
`else if (isGrpc && !value)` branch in `_computeCodes` was **dead code**.

**True root cause:** the `=== ''` assumption was wired into THREE places, and
the load-bearing one was the detection (`_isGrpcOperation`, line ~341), not the
code computation. Real AMF models omit the `statusCode` node entirely; they do
not emit an empty string.

### Why the original 20 tests didn't catch it

The static fixture `demo/grpc-test.json` (committed in `734bd6f`) encoded
`statusCode: { "@value": "" }` — an **empty string**, which the old code already
handled. The fixture did not match what AMF actually produces. So the suite
passed *with or without* the fix and validated nothing. My added "absent
statusCode" tests also missed it, because they stripped statusCode from the
`returns` array I set directly, while `_isGrpcEndpoint` reads it from the
`endpoint` graph (`supportedOperation → returns → statusCode`) — a different
object that still carried `""`.

## Resolution

1. **Fix the detection too** — `_isGrpcOperation`: `statusCode === ''` → `!statusCode`.
   (Plus the already-present `_computeCodes` / `_statusMatches` `!value` guards,
   which are correct and now actually reachable.)
2. **Make the fixture faithful** — removed the 4 empty-string `statusCode` nodes
   from `demo/grpc-test.json` so it mirrors the real model (node absent). This is
   what turns the suite into a real regression guard.
3. **Tests now exercise detection** — added `detects the gRPC endpoint with an
   absent statusCode` and `reads statusCode as absent (undefined)`. With the
   faithful fixture, **16 tests are RED without the fix**, all green with it.

## Lessons (for the retro / future SDD runs)

- **Measure, don't assume the root cause.** The first "20 tests green" was a
  false signal — I should have treated "tests pass with AND without the fix" as
  a red flag immediately, not shipped on it.
- **A fixture that doesn't match the real model is worse than no fixture** — it
  manufactures false confidence. Validate fixtures against a real generated model.
- **Verify the fix runs in the real runtime before claiming done.** One DevTools
  probe in the actual v6 console exposed in 10 seconds what the test suite hid.
- **TDD discipline:** a fix without a test that is RED-without-it is unverified.
  The RED check (stash the fix, run, confirm failures) must be mandatory, not
  optional.

## Files

- `src/ApiResponsesDocument.js` — `_isGrpcOperation` + `_computeCodes` + `_statusMatches`
- `demo/grpc-test.json` — removed empty-string statusCode nodes (faithful to real model)
- `test/api-responses-document-grpc.test.js` — detection + absent-statusCode regression tests

# Stabilize the Verticales deep link

Opening Autónomos from Inem Sellar should show the target card once, without reopening the embedded view or competing scroll animations. Keep the public link and the regular sidebar navigation.

Scope: patch, tests and one explicitly authorized local commit on main; no push or task-board changes by this session. Forecast: under 250 changed lines; ask on delivery risk.

- [x] VDL-1: Restore the route without adding history entries or rewriting an unchanged frame URL. Cover direct entry, hash changes and history traversal; refresh the shared script version.
- [x] VDL-2: Position the embedded card without animated scrolling or repeated focus writes. Run isolated server tests and deterministic JavaScript coverage for both route modes.

## Verification

- Before the patch: three deterministic failures exposed unwanted initial history pushes in both route modes and repeated smooth scrolling in the view.
- After the patch: 50 isolated server tests and three JavaScript regression tests passed. Shell and inline script syntax and whitespace checks passed.
- Headless Chromium could not start under the execution restrictions, including after the approved rerun. The deterministic tests do not exercise real browser history or measure painting.
- Receipt-driven review is disabled by the existing global preference. The local commit was authorized separately after verification; publication remains outside this session's scope.

Next: validate the original link from Inem Sellar on a physical iPhone after the Mac assistant publishes the patch.

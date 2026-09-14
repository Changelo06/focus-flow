# Study Track 1.0.1 — timer reliability and task history

## Purpose and source baseline

This patch addresses timers appearing to stop when the Android app is backgrounded, unreliable task time totals, and task lists becoming hard to navigate. Elaborate analytics and a broader redesign are deferred.

The supplied local `focus-flow-main` folder contained the current Android/Capacitor app, while GitHub contained an older web-only revision. Commit `5485100` imports that local source as a separate baseline so the actual fixes can be reviewed independently. It preserves the existing app identity (`com.sample.app`), themes, assets, and mobile setup. Generated output, dependencies, machine-specific SDK paths and signing material are excluded. Work was performed in a fresh checkout; the supplied original folder was not edited.

## Timer behavior

- Time comes from a saved timestamp and measured elapsed duration, rather than the number of JavaScript interval callbacks received. The interval only refreshes the view.
- Background suspension, switching tabs inside the app, returning to the foreground and reloading reconcile the timer against real elapsed time. An overdue timer is capped at its intended duration, not at the later reopen time.
- Focus and break transitions save timestamped segments, including fractional seconds. The existing shared-duration focus/break bar is retained: switching modes does not create another independent countdown.
- Pauses count toward neither focus nor break time, and the paused state survives reload.
- End session and Stop save actual elapsed time as `ended-early`. Reset also saves any active partial session before creating a fresh timer. Empty idle resets create no history record.
- Finishing a timer does not complete its task. Task completion is a separate explicit action.
- Pause/Resume is visible beneath the timer. Early ending displays “Session saved”; full countdown completion displays “Complete!”.
- A small saved-today summary reports focus minutes, break minutes and fully completed sessions. It deliberately excludes the currently running session until saved.

## Storage and duplicate prevention

`lockin-timer-v1` stores a versioned object containing the active timer and session journal. Each session has a stable ID. Active state and completed history are committed together in one synchronous localStorage write. Finishing an already-recorded session does not append a duplicate. Logging is no longer a side effect of mounting the TimerView component.

Each journal record contains task ID and title snapshot, start/end timestamps, focus/break seconds, outcome, and timestamped segments. Unassigned focus is recorded too. A deleted task does not erase existing session records; a task title captured at timer start remains available.

The existing `lockin-tasks` and `lockin-archived-tasks` values are retained. Their pre-patch totals are treated as legacy totals. New session totals are derived from the journal for display and are never repeatedly added into the persisted legacy counters. This prevents duplicate accumulation after navigating or reloading. Existing completed tasks without a completion timestamp keep that timestamp unknown; the patch does not invent completion dates.

Detailed session history starts with this patch. Historical segment timestamps cannot be reconstructed from old aggregate counters. Per-task totals still include those old counters, but date-based charts now use actual recorded segments instead of attributing all focus time to task creation day. Segments crossing local midnight are split across the correct days. Existing charts remain; no new elaborate analytics were added.

Malformed timer JSON is copied to a recovery key before starting a fresh timer. Storage-write failures produce a visible message, but storage quota exhaustion can still prevent durable saving. Clearing app data or uninstalling removes local records; this is not cloud synchronization or backup. Simultaneous independent browser tabs are not a supported multi-writer workflow.

## Android completion alerts

- Native local notifications are scheduled for the future completion timestamp while JavaScript is active; notification delivery does not require a running JavaScript interval.
- Pending timer/completion alerts are cancelled and rescheduled on state changes. Native operations are serialized so an earlier slow schedule cannot recreate an alert after Pause or Reset.
- Notification permission is requested when starting focus. Denied permission or scheduling failure is surfaced without preventing time tracking.
- Android exact-alarm permission is checked. If unavailable, the UI explains the potentially delayed fallback and points users to the app's Alarms & reminders setting. The implementation does not automatically change system settings.
- `allowWhileIdle` is enabled. Android Doze quotas, device power policies, notification-channel preferences and user permissions still govern delivery.
- The manifest declares `POST_NOTIFICATIONS` and `SCHEDULE_EXACT_ALARM`. A real monochrome notification icon replaces the missing sample icon. The missing custom native sound reference is removed so the system notification sound can be used.
- There is no permanent background service, wake-lock loop or second-by-second notification refresh. The earlier JavaScript-driven persistent notification is retired from the active timer path. Timer controls are in the app; a notification tap opens it.
- Android version is incremented to versionCode 2 / versionName 1.0.1.

The app catches up and saves completion when it next executes. It does not promise JavaScript callbacks or task database updates at the exact instant the OS suspends the app. Force-stop, disabled notifications, cleared data, manual clock changes and manufacturer restrictions have distinct behavior; precise alert delivery under those conditions is not guaranteed. Web timer recovery works, but native lock-screen notifications apply to the Android package rather than ordinary browser tabs.

## Task organization and history UI

- Today: unfinished tasks due later today, including the current instant.
- Overdue: unfinished tasks whose exact due timestamp has passed, including earlier today.
- Upcoming: unfinished tasks due after today.
- Anytime: tasks without a due date. New task creation now allows an omitted deadline.
- Completed: newest known completion timestamp first, followed by legacy tasks with unknown completion dates using creation order as a fallback.

The default group is Today. Search matches task title and description and updates each group's count. Active tasks sort by nearest deadline with stable tie-breakers. The view displays 20 tasks at a time and offers Show more. Completed tasks are out of the active list. Groups refresh periodically and on visibility changes. Task details continue to show accumulated focus and break totals.

History has its own navigation item. It groups records by local start date, displays start/end times, separate focus and break durations and completed/ended-early outcomes, supports task-title search, and shows 30 records at a time. No history is automatically deleted. The prominent bulk-clear control has been removed from the main task flow to reduce clutter and accidental data loss; individual task deletion remains available.

## Validation

- `npm test`: 12 tests pass across timer, native notification mocks, task grouping and midnight allocation (including the existing smoke test).
- `npx tsc --noEmit -p tsconfig.app.json`: passes.
- `npm run lint`: zero errors; eight existing component-export hot-reload warnings remain. Small imported-baseline lint/type issues were corrected without changing the lint rules, and generated Android/PWA output is excluded.
- `npm run build`: passes, including PWA generation. Existing bundle-size and stale Browserslist warnings remain.
- `npx cap sync android`: passes.
- `gradlew.bat assembleDebug --no-daemon`: passes with the installed Android Studio JDK and SDK. Existing Gradle/plugin deprecation warnings remain.
- Browser smoke check: start focus, switch to break, pause, reload while paused, end early and inspect separate history totals; create a task with no deadline; verify Anytime membership and explicit movement to Completed. Task layout visually inspected.

Automated tests cover suspension/catch-up and duration capping; one-time completion across reload; fractional focus/break time; paused-time exclusion; active and paused restoration; early stop/reset; preserving legacy totals; notification permission denial and exact-alarm fallback; deadline sorting; and local-midnight allocation. Native notification delivery is mocked in tests, not measured on hardware.

## Build and release checklist

1. Install locked dependencies with `npm ci`.
2. Run the tests, TypeScript and lint commands above.
3. Run `npm run build` followed by `npx cap sync android`.
4. Build with the configured Android SDK/JDK using `android/gradlew.bat assembleDebug --no-daemon`, or use Android Studio for a release build.
5. Sign an update with the same signing key as the distributed APK and retain the existing application ID to preserve installed app data. The generated debug APK is a test artifact, not a signed production release. Do not uninstall the user's existing app merely to bypass a signature mismatch.
6. Before redistribution, test on the affected user's Android model: leave the app for several minutes, lock the screen past completion, reopen, and verify one session with accurate totals.
7. Repeat with notification permission denied, exact-alarm permission denied/granted, Pause/Resume, End session, and a session crossing midnight. Check sound and notification-channel preferences.
8. Verify an in-place upgrade preserves existing tasks and totals. Separately document force-stop/reboot behavior; those scenarios have not been device-tested here.

The pushed branch contains source, tests and this documentation. Build outputs and signing credentials are not committed.

# Unit Mental Model Map and Guidebook

This guide gives a full-stack mental model of the Unit programming environment, from runtime primitives to editor interactions and deployment.

It is grounded in:
1. Local source code in this repository.
2. The complete DeepWiki section set under `https://deepwiki.com/samuelmtimbo/unit/*` (all linked pages from the main index).

## 1. One-Page Mental Model

Unit is a specification-driven, reactive graph runtime with a visual editor front-end.

Programs are graph specs.
Graph specs instantiate graphs.
Graphs contain units and merges.
Units communicate through pins.
Pins push, pull, and invalidate data.
The editor mutates graph specs through action/reducer operations.
The system runs on web/node/worker/electron through an API abstraction layer.

Compact model:

```text
GraphSpec JSON
  -> fromSpec/fromBundle
  -> Graph runtime instance
      -> Unit instances
      -> Merge instances
      -> Pin connections
  -> reactive execution (push/pull/invalidate)

Editor UI
  -> gestures/shortcuts/modes
  -> action creation
  -> reducer/spec mutation
  -> graph runtime update
```

## 2. Core Architectural Layers

Unit has five practical layers:

1. Platform Boot + API adapters
2. System Core (System + Registry)
3. Spec/Bundle layer (definitions + packaging)
4. Runtime graph engine (Graph/Unit/Pin/Merge)
5. UI/component/editor layer

### 2.1 Platform Boot + API adapters

Purpose: give runtime code a uniform interface to host capabilities.

Key files:
- `src/client/platform/web/boot.ts`
- `src/client/platform/node/boot.ts`
- `src/API.ts`

Web boot composes browser APIs and mounts render surfaces, then attaches runtime visual layers.
Node boot uses JSDOM plus HTTP/WebSocket adapters and file-backed localStorage.

### 2.2 System Core

Purpose: hold global context and lifecycle state for running graphs.

Key files:
- `src/system.ts`
- `src/boot/index.ts`
- `src/Registry.ts`

`System` holds:
- API adapters
- registry and specs
- classes/components catalogs
- global references
- input/cache/feature state

`Registry` manages:
- spec IDs
- injection/remapping
- reference counts
- forking and cleanup

### 2.3 Spec and Bundle layer

Purpose: define programs as declarative specs and package dependencies.

Key files:
- `src/spec/fromSpec.ts`
- `src/spec/fromBundle.ts`
- `src/spec/evaluate/evaluateBundleSpec.ts`
- `src/bundle.ts`
- `src/build/bundle.ts`

Flow:
- Bundle/spec is loaded.
- Data/memory references are evaluated.
- Spec compiles into a Graph class.
- Class instantiates graph runtime.

### 2.4 Runtime graph engine

Purpose: execute graph behavior with reactive dataflow.

Key files:
- `src/Class/$.ts`
- `src/Class/Unit/index.ts`
- `src/Primitive.ts`
- `src/Class/Functional/index.ts`
- `src/Class/Graph/index.ts`
- `src/Pin.ts`

Class stack:

```text
$ (event/lifecycle base)
  -> Unit (pins + IO contract)
    -> Primitive (pin event wiring + propagation mechanics)
      -> Functional (f(done/fail) execution model)

Graph extends component-capable Unit and composes many Units/Merges.
```

### 2.5 UI/component/editor layer

Purpose: visual programming and interaction.

Key files:
- `src/client/component.ts`
- `src/system/platform/component/app/Editor/Component.ts`
- `src/system/platform/component/app/GUI/Component.ts`
- `src/system/platform/component/app/Search/Component.ts`

Component system is its own framework with lifecycle, parent/slot trees, style/layout reflection, and event dispatch.
Editor orchestrates graph mutation, rendering, modes, gestures, navigation, and fullwindow behavior.

## 3. Runtime Execution Semantics

This section is the most important for true understanding.

### 3.1 The object base (`$`)

`$` provides:
- event emitter behavior
- global registration IDs
- destroy lifecycle

Key file:
- `src/Class/$.ts`

Mental model: everything in Unit is a managed runtime object with explicit lifecycle boundaries.

### 3.2 Units and pins

`Unit` owns typed named input/output pins.
Pins can be:
- data pins
- ref pins
- constant or non-constant
- ignored or active

Key files:
- `src/Class/Unit/index.ts`
- `src/Pin.ts`

`Pin` methods drive runtime data behavior:
- `push`
- `pull`
- `take`
- `invalidate`

### 3.3 Primitive scheduling and propagation

`Primitive` wires pin events to processing callbacks and tracks activation/invalid states.

Key file:
- `src/Primitive.ts`

State tracked includes:
- active inputs/outputs
- invalid sets
- forwarding/backwarding flags
- buffered events for replay

Propagation primitives:
- forward data to outputs
- backward pull/take from inputs
- forward empty/pull signals

### 3.4 Functional computation contract

`Functional` adds deterministic compute contract:
- implement `f(i, done, fail)`
- runtime calls when input readiness conditions are met
- outputs are emitted through `_done`
- failures through `_fail`

Key file:
- `src/Class/Functional/index.ts`

Mental model: Functional is Unit + scheduler + compute callback.

### 3.5 Graph as composed runtime

`Graph` is a composite runtime unit with:
- child units map
- merge map
- exposed input/output pin sets
- spec-backed mutable structure

Key file:
- `src/Class/Graph/index.ts`

`Graph` supports:
- add/remove units
- add/remove/modify merges
- expose/cover/plug/unplug pins
- set functional pin sets
- snapshots and restoration
- spec forking and edit events

## 4. Spec Mutation Model (Action/Reducer Style)

Unit editor changes do not mutate runtime ad hoc.
They follow an operation model:

1. User action/gesture occurs
2. Editor creates action payload
3. Reducers update spec form
4. Runtime graph reconciles to spec
5. Optional pod/remote propagation occurs

Key files:
- `src/spec/actions/G.ts`
- `src/spec/reducers/spec.ts`
- `src/spec/reverseAction.ts`
- `src/spec/reverseSelection.ts`
- `src/Class/Graph/index.ts`

Mental model: graph editing is operational and reversible, not random imperative state mutation.

## 5. Editor Mental Model

Editor has two intertwined worlds:

1. Graph world: units/merges/pins/data nodes and links
2. Component/layout world: UI hierarchy, frames, tree layout, and fullwindow rendering

Key file:
- `src/system/platform/component/app/Editor/Component.ts`

### 5.1 Modes

Mode keys:
- `q` info
- `a` data
- `s` add
- `d` remove
- `f` change
- `Shift` multiselect

Key files:
- `src/client/component/app/graph/MODE_TO_KEY.ts`
- `src/client/graph/constant/KEY_TO_MODE.ts`
- `src/client/graph/shortcut/modes.ts`

### 5.2 Shortcuts and control

Examples:
- `;` / `Ctrl+;` search toggle
- `` ` `` fullwindow
- `Ctrl+s` save
- `Ctrl+o` open
- `Ctrl+z` undo
- `Ctrl+Shift+z` redo
- `Ctrl+l` layout toggle
- `Ctrl+m` minimap toggle

Key file:
- `src/system/platform/component/app/Editor/Component.ts`

### 5.3 Gesture semantics

Gestures are first-class editing commands.

Examples:
- line gestures can create exposed pins and connections
- circle gestures compose contained nodes
- rectangle gestures create component-like empty graph units
- long press drives compose/explode and context actions

Key file:
- `src/system/platform/component/app/Editor/Component.ts`

### 5.4 Entering subgraphs

Subgraph navigation is deep and runtime-aware:
- entering a unit can materialize/attach cached sub-editor state
- fullwindow/component frame state is coordinated during transitions

Key file:
- `src/system/platform/component/app/Editor/Component.ts`

## 6. Component and Rendering Framework

Unit uses its own component model rather than React/Vue.

Key file:
- `src/client/component.ts`

Core ideas:
- explicit mount/unmount lifecycle
- slot-based composition
- parent/root and parent-root relationships
- event system around components
- styling/layout extraction and reflection

Supporting files:
- `src/client/context.ts`
- `src/client/style.ts`
- `src/client/extractStyle.ts`
- `src/client/rawExtractStyle.ts`
- `src/client/reflectComponentBaseTrait.ts`

## 7. Type System and Parsing

Parser/type system underpins pin data editing and compatibility checks.

Key files:
- `src/spec/parser.ts`
- `src/spec/evaluate.ts`
- tests under `src/test/spec/`

Conceptual outputs:
- tree node representations of values/types
- type compatibility checks
- parsing/validation for data editor interactions

Mental model: editor data trees and runtime pin data are connected through parser/type logic.

## 8. Platform Integration Model

### 8.1 API abstraction

`API` type defines host operations for:
- HTTP/network
- window/document/media/input
- storage/file
- layout/text/worker

Key file:
- `src/API.ts`

### 8.2 Web platform

`webBoot` assembles browser adapters and attaches rendering layers.

Key files:
- `src/client/platform/web/boot.ts`
- `src/client/platform/web/render.ts`

### 8.3 Node platform

`node` boot builds a server-capable runtime with JSDOM and WS/HTTP integration.

Key files:
- `src/client/platform/node/boot.ts`
- `src/server/index.ts`
- `src/server/serve.ts`

## 9. Build, Packaging, and Distribution

Project supports:
- library usage (`@_unit/unit`)
- CLI usage (`unit`)
- static bundle build

Key files:
- `package.json`
- `src/server/index.ts`
- `src/build/bundle.ts`

Generated catalogs:
- `src/system/_specs.ts`
- `src/system/_classes.ts`
- `src/system/_components.ts`
- `src/system/_ids.ts`

These are central for default runtime capability.

## 10. AI/LLM Surface in Unit

Unit includes AI-oriented primitives in default class catalog.

Key files:
- `src/system/_classes.ts`
- `src/system/f/ai/LLMChat/index.ts`
- `src/system/f/ai/LLMComplete/index.ts`
- `src/system/f/ai/LLMChatStream/index.ts`
- `src/Class/Holder/index.ts`
- `src/Class/Semifunctional/index.ts`

Mental model:
- `LLMChat` and `LLMComplete` are functional request/response units.
- `LLMChatStream` is holder/semi-functional for stream chunk emission and cancellation.

## 11. Practical Guidebook: How to Work Effectively in This Codebase

### 11.1 If you need to add a new primitive/unit

1. Add implementation under `src/system/f/...`.
2. Add `spec.json` for docs/metadata/type integration.
3. Register in system catalogs (`_classes`, potentially `_ids` and `_specs` generation flow).
4. Add tests in `src/test/system/...`.

### 11.2 If you need to change graph semantics

1. Start with `src/Class/Graph/index.ts`.
2. Check matching reducers in `src/spec/reducers/spec.ts`.
3. Verify action shapes in `src/spec/actions/G.ts`.
4. Update reverse operations if needed.
5. Validate editor behavior in `Editor/Component.ts`.

### 11.3 If you need to change editor behavior

1. Use `src/system/platform/component/app/Editor/Component.ts` as command center.
2. Check mode keyboard mapping files.
3. Check GUI/Search/Datum/DataTree components for satellite behavior.
4. Validate gesture and shortcut interactions.

### 11.4 If you need platform behavior changes

1. Change API contract carefully in `src/API.ts`.
2. Implement adapter changes in web/node/worker boots.
3. Keep behavior parity where intended.

### 11.5 If you need type/data editing changes

1. Start in `src/spec/parser.ts`.
2. Review data-tree component expectations.
3. Add/adjust parser tests in `src/test/spec/`.

## 12. Debugging Playbook

### 12.1 Graph bugs

1. Inspect graph edit events and action payloads.
2. Compare spec before/after mutation.
3. Verify merge/pin topology and exposed pin sets.
4. Check constant/ref/ignored pin flags.

### 12.2 Dataflow bugs

1. Trace pin lifecycle: push -> active -> pull/take -> invalidate.
2. Check Primitive flags (`_forwarding`, `_backwarding`, invalid sets).
3. Confirm Functional readiness conditions.

### 12.3 Editor UX bugs

1. Check mode state and keyboard listeners.
2. Check selection and node-layer state.
3. Verify tree layout vs graph layout branch behavior.
4. Verify fullwindow/frame transitions.

### 12.4 Platform bugs

1. Confirm API method is implemented for current boot target.
2. Check Node polyfill behavior (JSDOM, streams, websocket upgrades).
3. Check browser-only assumptions in shared code.

## 13. Suggested Learning Path

### Stage 1: Runtime foundations

1. Read `src/Class/$.ts`.
2. Read `src/Pin.ts`.
3. Read `src/Class/Unit/index.ts`.
4. Read `src/Primitive.ts`.
5. Read `src/Class/Functional/index.ts`.

### Stage 2: Graph composition

1. Read `src/Class/Graph/index.ts` constructor and init paths.
2. Read add/remove/plug/unplug methods.
3. Read snapshot/bundle/fork methods.

### Stage 3: Spec pipeline

1. Read `src/spec/fromSpec.ts`, `src/spec/fromBundle.ts`.
2. Read `src/Registry.ts`.
3. Read `src/spec/actions/G.ts` and reducers.

### Stage 4: Editor

1. Read `src/system/platform/component/app/Editor/Component.ts` in slices:
2. modes and keyboard
3. gesture handling
4. graph mutation and pod dispatch
5. subgraph/fullwindow flows

### Stage 5: Platform

1. Read `src/API.ts`.
2. Read `src/client/platform/web/boot.ts`.
3. Read `src/client/platform/node/boot.ts`.

## 14. DeepWiki Full-Read Notes

The full DeepWiki set for this repo is broadly accurate and useful for orientation.

Important caveats from cross-checking:
1. Some file links are stale or normalized (for example `src/system/index.ts` style references).
2. Core architecture claims are still consistent with current local source layout.
3. DeepWiki is best treated as a map; local source is the execution truth.

## 15. Quick Reference (High-Value Files)

If you only keep 20 files in working memory, use these:

1. `src/Class/Graph/index.ts`
2. `src/Class/Unit/index.ts`
3. `src/Primitive.ts`
4. `src/Class/Functional/index.ts`
5. `src/Pin.ts`
6. `src/Registry.ts`
7. `src/boot/index.ts`
8. `src/system.ts`
9. `src/spec/fromSpec.ts`
10. `src/spec/fromBundle.ts`
11. `src/spec/evaluate/evaluateBundleSpec.ts`
12. `src/spec/actions/G.ts`
13. `src/spec/reducers/spec.ts`
14. `src/system/platform/component/app/Editor/Component.ts`
15. `src/client/component.ts`
16. `src/system/platform/component/app/GUI/Component.ts`
17. `src/system/platform/component/app/Search/Component.ts`
18. `src/API.ts`
19. `src/client/platform/web/boot.ts`
20. `src/client/platform/node/boot.ts`


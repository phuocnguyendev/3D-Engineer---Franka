# RoboSim

Interactive 3D robotics simulation built with React Three Fiber.  
Two modules: a **Franka Panda manipulator** (forward kinematics) and a **Ridgeback mobile base** (differential drive).

---

## Stack

| Layer | Library |
|-------|---------|
| Renderer | Three.js r184 + React Three Fiber v9 |
| Helpers | @react-three/drei |
| State | Zustand v5 |
| UI controls | Leva |
| Routing | React Router v7 |
| Build | Vite 8 + TypeScript 6 |
| Package manager | Yarn 1 |

---

## Getting started

```bash
# Install dependencies
yarn

# Start dev server (hot-reload)
yarn dev
# → http://localhost:5173

# Type-check + production build
yarn build

# Preview production bundle
yarn preview

# Lint
yarn lint
```

Place the GLB asset in `public/`:
```
public/
└── ridgeback_franka.glb   # required by both pages
```

---

## Project structure

```
src/
├── pages/
│   ├── ManipulatorPage.tsx      # Franka Panda FK scene
│   └── MobileBasePage.tsx       # Ridgeback differential-drive scene
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Layout.tsx
│   ├── scene/
│   │   ├── TrajectoryTrail.tsx  # live path visualisation
│   │   ├── CameraRig.tsx        # follow-cam
│   │   ├── Lights.tsx
│   │   └── Floor.tsx
│   └── ui/
│       ├── TelemetryPanel.tsx
│       ├── JointSliders.tsx
│       └── PerformancePanel.tsx
│
├── hooks/
│   ├── useDifferentialDrive.ts  # physics + trail push (runs in useFrame)
│   ├── useKeyboard.ts           # low-latency key state via ref
│   └── useRobotModel.ts         # GLTF load + joint discovery
│
├── store/
│   ├── useDriveStore.ts         # pose / velocity / trail (Zustand)
│   └── useManipulatorStore.ts   # joint angles (Zustand)
│
└── types/robot.ts               # shared TypeScript interfaces
```

---

## How each module works

### Manipulator — Forward Kinematics

`ManipulatorPage` loads the GLB, traverses the scene graph to discover
`panda_joint*` nodes, and stores their `Object3D` references.  
Every frame (`useFrame`), it reads `jointAngles` from `useManipulatorStore`
and writes `object.rotation[axis]` directly — no React re-render needed.

Joint limits are declared in the `FRANKA_LIMITS` map at the top of
`ManipulatorPage.tsx`.

### Mobile Base — Differential Drive

`useDifferentialDrive` runs in `useFrame` and:

1. Reads key state from `useKeyboard` (ref-based, zero React overhead).
2. Ramp-limits linear and angular velocity with the module-level `ramp()` helper.
3. Integrates pose with Euler kinematics on the XZ plane.
4. Pushes a `TrajectoryPoint` to `useDriveStore` every **5 cm** of travel (80 ms gate).
5. Calls `setPose` + `setVelocity` each frame for the HUD.

`TrajectoryTrail` polls the store every 3 frames (~20 fps) and appends the
robot's current position as a **live tip** so the line follows the robot
smoothly between trail pushes.

---

## Extending the simulation

### Add a new Franka joint

1. Add the joint name + limits to `FRANKA_LIMITS` in `ManipulatorPage.tsx`.
2. The slider is auto-generated in `JointSliders.tsx` — no extra changes needed.

### Add objects to the mobile-base scene

Import your component inside `MainScene` in `MobileBasePage.tsx`.  
It will share `useDriveStore` pose automatically.

### Add a third page / robot

1. Create `src/pages/MyRobotPage.tsx`.
2. Add a `<Route>` in `App.tsx`.
3. Add a nav entry to `NAV_ITEMS` in `Navbar.tsx`.
4. Add a Zustand store in `src/store/` for robot-specific state.

### Change trail appearance

`TrajectoryTrail` accepts `color` (hex) and `yOffset` (metres) props — both
are already wired to the **Drive Settings v2** Leva panel.  
Line width is `lineWidth={2}` in `TrajectoryTrail.tsx`.

### Tune drive physics

All drive parameters are exposed at runtime in the **Drive Settings v2** Leva
panel and persisted in `localStorage`. To change defaults, edit the `value:`
fields inside `useControls("Drive Settings v2", ...)` in `MobileBasePage.tsx`.

---

## Key architectural decisions

| Decision | Why |
|----------|-----|
| `getState()` inside `useFrame` instead of hook subscription | Reads current Zustand state synchronously without triggering React renders |
| `useKeyboard` returns a ref | Key state is always current at 0 React overhead — no re-render on every keydown |
| `ramp()` at module level | Pure function; defining it inside `useFrame` would recreate it 60× per second |
| `instanceof` over `.isMesh` / `as` casts | Type-safe Three.js object narrowing — no unsafe casts |
| `depthTest={true}` on trail | Robot mesh naturally occludes the trail line where they intersect |

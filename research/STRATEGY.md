# Strategic AI and territory handover

## Approach and provenance

The implementation uses utility-based decision making with persistent faction plans, hard legality constraints, hysteresis and seeded variation. This is the established game-AI technique described in [Game AI Pro: An Introduction to Utility Theory](https://www.gameaipro.com/GameAIPro/GameAIPro_Chapter09_An_Introduction_to_Utility_Theory.pdf) and [Dual-Utility Reasoning](https://www.gameaipro.com/GameAIPro2/GameAIPro2_Chapter03_Dual-Utility_Reasoning.pdf). Reserve and retaliation rules are game abstractions inspired by the distinctions in [RAND: Understanding Deterrence](https://doi.org/10.7249/PE295).

The weights and doctrine thresholds are custom game balance, not a proven model of real-world politics, a Nash-equilibrium solver, a chess search, or a mathematical chaos simulation. Political disorder emerges from different commitments, limited observations, timing and responses to attacks. Existing player-configured alliances remain authoritative.

## Faction memory and policy

Five doctrines are shuffled among AI factions per seeded match, independently of nationality: forward pressure, defensive restraint, assured retaliation, opportunistic pressure and unstable brinkmanship. They differ in first-use permission, initial delay, reserve fraction, wave spacing, risk variation and naval posture. Doctrines, random-generator state, grievances, nuclear attack history, review deadlines and launcher assignment persist in snapshots.

A faction periodically scores observe, recon, defend, contain and strike. A modest incumbent bonus and review window stabilize plans. Damage and detected incoming warheads trigger reassessment. Restrained doctrines hold first use; an attack on the faction or a declared ally permits nuclear retaliation. Aggressive and volatile factions can stage first use after a preparation window. Opportunists wait for an observed launch or sufficient pressure.

Only one launcher is assigned to the next strategic command. Defensive silos remain available; an AI silo that fires a limited strike voluntarily prepares defense again. Wave cooldown, in-flight commitments and reserve floors prevent simultaneous arsenal dumping. Platforms alternate where available; a platform without a reachable target yields its slot temporarily. Nuclear bombers inherit a host-assigned payload and use the normal ingress/return rules.

Target utility considers population value, known military installations, the current rival, travel, observed silo defenses, damage requirements and already committed friendly/allied warheads. Friendly units/cities inside the blast footprint veto a target. Hidden installation coordinates and hidden missile destinations do not enter the planner. Ground intel must come from sensors or a revealed launch, as in manual gameplay.

Conventional behavior retains actual unit ranges, fuel and fleet routing: restrained fleets screen domestic sea zones; stronger aggressive groups intercept visible contacts; outnumbered groups fall back. Hosts limit active sorties, keep fighters in reserve during quiet periods, and prioritize local air threats, naval contacts or a staged bomber objective.

## Control handover

Menu → Hand over to AI transfers the player's existing territory and resumes a paused operation. The header and menu offer Take command while AI is active. Takeover stops new strategic AI orders for that faction while accepted movement, launches, combat and returns continue. Direct manual commands override AI for that unit/fleet. Handover retains pending one-shot FIFO commands rather than redirecting or duplicating them.

The control flag and faction memory persist across browser reloads; legacy saves start with manual player control and receive seeded doctrine state. Simulation still runs in the active browser tab. Closing every game tab does not run an offline server simulation. Existing session controller/CAS protections remain in force.

## Validation

139 engine/state/API tests pass, including doctrine diversity and reproducibility, no opening all-silo salvo, restrained first-use policy, retaliation, reserves, target knowledge, friendly-fire veto, target deconfliction, manual overrides and deterministic restoration. Browser tests cover menu handover, automatic own-fleet orders, immediate header takeover, retained orders, persistent AI control/doctrine, and normal FIFO player commands.

Two three-faction, one-hour self-play scenarios use the same real movement, damage, projectiles and save validation as gameplay. With seeds 42 and 91 after the shorter preparation-time revision, the aggressive faction's first launch occurs at second 421, the defensive faction responds at 721 after an actual nuclear hit, and the opportunist enters at 901 or 1141. Only one launch occurs in the first 600 seconds. They produce 7 and 6 launches over the hour while all three factions retain arsenal. These focused checks establish the requested behavior; they are not a competitive win-rate benchmark.

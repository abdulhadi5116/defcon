# Fleet collision disabled

The latest user instruction disables collision avoidance between all fleets, including friendly and allied fleets. Fleets can pass through or remain overlapping without lateral steering, separation pushes, waiting for traffic, or a minimum fleet gap.

The fleet avoidance module and its tuning constants have been removed. Legacy avoidance vectors and passing-side state are discarded during movement preparation, so old saves cannot reintroduce a push. Existing save validation still rejects malformed legacy values.

Course braking/acceleration, rigid formation movement, pursuit locks, maritime permissions, coastline clearance, safe pathfinding and progressive shore recovery remain active. Visual ship slots remain independent of selection.

Tests cover head-on, scissor and four-way crossings, stationary overlaps, allied/enemy traffic, original destinations, deterministic save restoration and island clearance.

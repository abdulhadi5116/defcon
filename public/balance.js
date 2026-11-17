// Strategic map degrees, not real-world battery kilometers. See research/BALANCE.md.
export const DEFENSE={range:10,radar:20,reload:10,airChance:.1,warheadChance:.25,interceptorSpeed:1.2,maxAssigned:2};
export const FIGHTER_COMBAT={range:4,gunRange:1.5,gunReload:10,reload:15,radar:7,warheadChance:.25};
export const WARHEAD_SPEED={ballistic:.08,submarine:.12,direct:.06};
export const NAVAL_COMBAT={radarRange:12,battleshipRange:9,battleshipAirRange:5,battleshipAirReload:10,carrierGunRange:5,carrierGunReload:10};
export const BOMBER_NUCLEAR_RANGE=2;
export const PASSIVE_SUBMARINE_TARGET_RANGE=1.5;
export const SUBMARINE_NUCLEAR_RANGE=25;
export const FLEET_RADIUS=1;

export const AIRCRAFT_LAUNCH_INTERVAL={airbase:{fighter:5,bomber:10},carrier:{fighter:8,bomber:15}};

export const SUBMARINE_ACTIVE_RANGE=9;
export const WARHEAD_HP=8;
export const WARHEAD_HEALTH={ballistic:WARHEAD_HP,submarine:5,direct:10};

export const ASW_COMBAT={passiveDetection:8,activeDetection:12,carrierRange:1,fighterRange:2,fighterReload:10,carrierReload:8};

export const FLEET_AVOIDANCE={gap:1,lookahead:60,response:8};

export const NUCLEAR_CORRECTION={interval:30,maxStep:.05};

export const NUCLEAR_RELOAD={silo:10,submarine:120,bomber:120};

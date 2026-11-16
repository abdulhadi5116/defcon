// Strategic map degrees, not real-world battery kilometers. See research/BALANCE.md.
export const DEFENSE={range:10,radar:20,reload:8,airChance:.1,warheadChance:.25,interceptorSpeed:1.2,maxAssigned:2};
export const FIGHTER_COMBAT={range:5,gunRange:2,gunReload:3,reload:10,radar:7,warheadChance:.25};
export const WARHEAD_SPEED={ballistic:.06,direct:.06};
export const NAVAL_COMBAT={radarRange:12,battleshipRange:9,battleshipAirRange:7,carrierGunRange:3,carrierGunReload:4};
export const BOMBER_NUCLEAR_RANGE=2;
export const PASSIVE_SUBMARINE_TARGET_RANGE=1.5;
export const SUBMARINE_NUCLEAR_RANGE=20;
export const FLEET_RADIUS=1;

export const AIRCRAFT_LAUNCH_INTERVAL={airbase:{fighter:5,bomber:10},carrier:{fighter:8,bomber:15}};

export const SUBMARINE_ACTIVE_RANGE=9;
export const WARHEAD_HP=10;

export const ASW_COMBAT={passiveDetection:8,activeDetection:12,carrierRange:3,carrierReload:8};

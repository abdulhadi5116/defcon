# DEFCON v1.43 baseline reconstruction

## Source and provenance

User supplied `/Users/ghost/Downloads/defcon-win32-v143.exe` and explicitly requested reverse engineering and sound reuse. Installer SHA-256: `33d2edb954d2a3ba9a8f42ee33090f7be783444f875ff88fc7e4d6a790903e55`.

Read-only REA `open_binary` admitted the installer as PE32/x86. `innoextract` 1.10.8 extracted its four members, without running Windows installer code. The two DAT files are solid RAR archives, extracted with `unar`. The game EXE is UPX compressed; UPX 5.3.0 decompressed a temporary copy for static PE analysis. The original download remained unchanged.

- Unpacked temporary game EXE SHA-256: `8169bbbbb364084dadea790a004a4595acc9549dfcc5fc9a12884d072e4615e2`
- Packed game EXE SHA-256: `4e5645f54729914bfb2c9640a23831a4c8f830145b2fb5752726bb79efa009f4`
- `main.dat` SHA-256: `83419ebb60be5289052179a507cd01e8e2d18b41feaf31940b3e8e0caaaba409`
- `sounds.dat` SHA-256: `50e051a445419ee23aeff614661cf8b4aed71d8e0b540cefc2888d97d6c38c61`

REA's deep provider was unavailable: Ghidra, Hopper and IDA were not configured. No REA configuration was modified. The fallback used PEfile 2024.8.26 and Capstone 5.0.9 against the temporary unpacked PE. C++ RTTI type descriptors locate class complete-object locators, vtables and constructor references. This is static disassembly, not decompilation or observed Windows runtime behavior. Instruction excerpts are retained in `native-constructors.txt`.

## Observed native constants

`0x401790` converts a signed integer to the game's double representation. `0x41c6c0` divides an integer by the double at `0x534190`, which is exactly `100.0`. Constructors store the resulting movement value at object offset `0x210` and the turn parameter at `0x218`.

| Unit | Constructor | Native speed | Turn parameter | Other observed initialization |
| --- | --- | --- | --- | --- |
| Battleship | 0x444110 | 3 / 100 = 0.03 | 1 / 100 = 0.01 | Life 3 |
| Carrier | 0x446bf0 | 3 / 100 = 0.03 | 1 / 100 = 0.01 | Life 3; stock 6; launch-state fighter/bomber stocks 5/2 |
| Submarine | 0x4593a0 | 2 / 100 = 0.02 | 1 / 100 = 0.01 | Life 1; MRBM stock 5 |
| Fighter | 0x44aa50 | 10 / 100 = 0.10 | 4 / 100 = 0.04 | Fuel/range member initialized to 45 |
| Bomber | 0x445700 | 5 / 100 = 0.05 | 1 / 100 = 0.01 | SRBM stock 1; fuel/range member initialized to 140 |
| Missile | 0x454ff0 | 20 / 100 = 0.20 | 1 / 100 = 0.01 | Long- and short-range states |
| Silo | 0x458400 | Stationary | N/A | Life 25; stock 10 |
| Airbase | 0x442c00 | Stationary | N/A | Life 15; stock 10; launch states each permit 5 starting aircraft; capacity members 10/10 |
| Radar | 0x4578a0 | Stationary | N/A | Life 1; radar initialized to 30 |

Constructor arguments establish 120-second launch/preparation values for airbases/carriers; 240 for carrier anti-submarine and submerged submarine states; 120 for surfaced submarine and silo launch; 340 for silo defense; bomber nuclear preparation 240 and naval preparation 60. Mapping the constructor arguments to the web model is a derived interpretation, corroborated where possible by the manual. The web integrator uses these native constants in a new JavaScript implementation; this does not prove numerical parity with the original integrator.

## Primary references

- Official [DEFCON manual](https://cdn.akamai.steamstatic.com/steam/apps/1520/manuals/DEFCON%20manual.pdf), printed pp. 11 and 14–19: readiness, fleet size, right-click movement/state menu, aircraft launch/fuel/landing, garrison contents, silo defense/launch exclusivity and nuclear ranges by class.
- Installer `data/gameoptions.txt`, retained here as `classic-gameoptions.txt`: speeds 1/5/10/20; victory trigger 20%; victory timer 45 game minutes. Default score uses 2 enemy civilian deaths minus 1 own civilian death, as documented in the manual.
- Installer `data/sounds.txt`, retained as `classic-sounds.txt`: original sound event mappings, samples, gains, frequency parameters and playlist order.
- [User video](https://www.youtube.com/watch?v=GYYzCz19GbI): metadata identifies “EU vs Russia - nuclear whipeout [DEFCON - No commentary gameplay]”. Inspected its YouTube storyboard frames for silhouettes, fleet grouping and visual density. Full streaming playback was unavailable in headless Edge; the video alone was not used to infer numeric movement constants.

## Reused assets

`dist/assets/classic/manifest.json` records per-file SHA-256 provenance for 17 unit textures and all 115 original OGG files, including the 28 music samples listed in the original music group. OGG bytes are unmodified. Original bitmap textures (mostly 128×128) are converted to PNG by mapping luminance to alpha, equivalent to rendering their black backgrounds transparently; outlines remain the original pixels. The retained map geometry and background colors are unchanged. Units render at reduced opacity and no longer receive invented red diamond frames.

`tools/extract-classic-assets.py` reproduces extraction from a user-provided installer. Native executables are not shipped or executed by the web game. Original audio and graphic assets remain Introversion's work; this site remains owner-private.

## Implemented classic behavior

Finite deployment counts; one-to-six-ship fleets; slowest-member fleet pace; carrier and airbase garrisons; fighter/bomber launch modes; fuel consumption and automatic return/landing; submarine passive/active/surfaced states and sonar detection; radar-dependent contact visibility; silo defense/launch exclusivity; native-derived speed, turn and preparation values; 10/5/1 silo/sub/bomber payloads; original audio and soundtrack; original click semantics and 1/5/10/20 time speeds; default population-based scoring and inventory-based victory countdown. Naval routes avoid the retained coastline geometry.

## Explicit remaining differences

This is a source-backed reconstruction of the requested unit baseline, not a complete port of the Windows executable. Combat hit probabilities, missile arcs and damage falloff, aircraft steering/landing integrator, radar ghost expiry, coarse water routing, AI, preplaced opening forces and the two-faction scenario are JavaScript implementations and have not been proved equivalent to native v1.43. The readiness schedule (6,12,20,30 elapsed game minutes) is a reference calibration, not a recovered code path. Original music/sound files are reused exactly, but the full native positional mixer, DSP and survivor-linked playback modulation are not reproduced. Multiplayer and the original six-territory lobby remain outside this change. Battle lab is explicitly a sandbox with observer visibility and a 60-game-minute limit.

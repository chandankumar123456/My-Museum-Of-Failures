# Museum Audio Assets

This folder is intentionally optional.

The museum is fully audible without any files here. When a visitor enters
a room, the frontend's procedural ambient engine
(`src/lib/ambient-engine.ts`) synthesizes a unique drone per room using the
Web Audio API — detuned oscillators, shaped white noise, a slowly
breathing low-pass filter.

If you want to ship real recordings instead, drop matching MP3 (or any
browser-supported format the `<audio>` tag accepts) files here. The
audio manager performs a `HEAD` probe on first play; whichever path
returns 2xx wins, otherwise the procedural engine is used.

## Expected filenames

| Filename | Room slug | Mood |
| --- | --- | --- |
| `museum-ambience.mp3` | _default_ | Generic museum hush |
| `echoing-hall.mp3` | `hall_of_broken_dreams` | Long reverb, distant footsteps |
| `cold-warehouse.mp3` | `startup_cemetery` | Fluorescent hum, server fans |
| `underground-hum.mp3` | `burnout_basement` | Low rumble, pressure |
| `library-echo.mp3` | `academic_ruins` | Pages, distant typing, soft echo |
| `quiet-gallery.mp3` | `gallery_of_lost_potential` | Spotlight quiet, faint piano |
| `archive-room.mp3` | `the_regret_archive` | Tape hiss, paper, vintage bulbs |
| `wind-tunnel.mp3` | `abandoned_futures_wing` | Wind through corridors |
| `rain-room.mp3` | `relationship_graveyard` | Soft rain, faint thunder |

## Recommendations

- **Length**: 30–90 seconds, seamlessly looping.
- **Encoding**: 128–192 kbps MP3 or 96 kbps Opus. Larger files will work
  but slow first-play.
- **Loudness**: peak around -18 LUFS. The audio store starts at volume
  `0.3` and the procedural drones are tuned around that level — lower
  recordings keep the museum feeling quiet.
- **Licensing**: only ship audio you have explicit rights to. Royalty-free
  ambient libraries (Freesound CC0, Adobe Audition stock) are good fits.

## Testing

To force-disable real assets temporarily, just rename the file. The next
page load falls back to the procedural drone. To force the procedural
engine globally, comment out `ATMOSPHERE_TRACKS` in
`src/components/audio/audio-manager.tsx`.

## Why both?

Audio is the easiest layer to break the museum's atmosphere. A
procedural fallback means new contributors and CI environments hear
*something* coherent without managing binary assets. Real recordings
upgrade the experience when a sound designer is available, without
requiring code changes.

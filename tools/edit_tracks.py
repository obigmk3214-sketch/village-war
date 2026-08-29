#!/usr/bin/env python3
"""
Edits to the soundtrack, driven by the player's track-by-track critique.

These are real edits to the audio: sections re-ordered, dead passages cut out,
and dynamic arcs imposed where the recording was mastered flat. Originals are
untouched in music-original/ (hashes in music-originals.sha256).

Two techniques do most of the work:

  splice   — cut a sagging or repetitive passage out and crossfade the two good
             halves together. Every cut is snapped to a nearby local energy
             minimum, because a phrase end is far easier to hide a seam in than
             the middle of a sustained note, and then crossfaded over seconds.

  envelope — impose a gain curve over the whole piece. Several of these tracks
             vary by under 5 dB from start to finish, which is exactly why they
             feel like they never go anywhere however long you listen. Adding a
             few dB of deliberate arc is the difference between "a loop" and
             "a piece that builds".

Run:  python3 tools/edit_tracks.py [letter ...]      (default: all)
"""
import math, os, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audio

WORK = '/tmp/vwaudio'
DEST = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'music')
XF = 2.2                       # crossfade seconds across a splice


def local_rms(s, ch, rate, t, win=0.25):
    i0 = max(0, int((t - win / 2) * rate)) * ch
    i1 = min(len(s), int((t + win / 2) * rate) * ch)
    tot = n = 0
    for k in range(i0, i1, ch * 4):
        v = s[k]
        tot += v * v
        n += 1
    return math.sqrt(tot / max(1, n))


def snap_quiet(s, ch, rate, t, search=1.8):
    """Nudge a cut point to the quietest moment within +/- `search` seconds.

    Phrase ends are quiet; sustained notes are not. Cutting at a dip means the
    crossfade has less to hide, so the join is far less likely to be audible.
    """
    best_t, best_v = t, None
    step = 0.05
    n = int(search / step)
    for k in range(-n, n + 1):
        tt = t + k * step
        if tt < 0.5:
            continue
        v = local_rms(s, ch, rate, tt)
        if best_v is None or v < best_v:
            best_v, best_t = v, tt
    return best_t


def splice(s, ch, rate, spans):
    """spans = [(start, end), ...] seconds -> concatenated with crossfades."""
    out = None
    for (a, b) in spans:
        a = snap_quiet(s, ch, rate, a) if a > 0.5 else a
        b = snap_quiet(s, ch, rate, b)
        part = audio.slice_sec(s, ch, rate, a, b)
        out = part if out is None else audio.crossfade(out, part, ch, rate, XF)
    return out


# --------------------------------------------------------------------- edits
# Each entry: (letter, source, output name, spans, envelope points, note)
# Envelope points are in OUTPUT time, after splicing.

EDITS = {
    'B': dict(
        src='kml-angevin', out='kml-angevin-edit',
        # "ok up to 50s but it needs more of a buildup after."
        # The recording has no climax to build to - 3.8 dB range over 4:38 - so
        # keep the opening the player likes, jump to the two strongest later
        # regions, and impose the arc the performance never had.
        spans=[(0, 52), (100, 124), (184, 208)],
        env=[(0, 0.66), (26, 0.72), (50, 0.80), (68, 0.90), (82, 1.0), (92, 0.98), (99, 0.80)],
        note='opening kept; builds through two later peaks; arc imposed'),

    'D': dict(
        src='kml-clash', out='kml-clash-edit',
        # "after a minute the song loses its energy" - measured: a real sag from
        # 0:55 to 1:28. Cut it out and rejoin the two strong halves.
        spans=[(0, 52), (88, 146)],
        env=[(0, 0.72), (30, 0.80), (52, 0.88), (85, 1.0), (107, 0.99)],
        note='energy sag at 0:55-1:28 removed'),

    'E': dict(
        src='kml-enchanted', out='kml-enchanted-edit',
        # "change it a lot or delete it (there are some nice parts though but not
        # many)". Keep only the strong passages, drop everything else.
        spans=[(12, 52), (58, 74)],
        env=[(0, 0.86), (20, 0.95), (40, 1.0), (50, 0.90)],
        note='reduced to only the strong passages'),

    'F': dict(
        src='kml-feast', out='kml-feast-edit',
        # "quite nice but a bit repetitive" - and my old endAt:72 ended it inside
        # its quietest dip. Shorten it, cut the dip, finish on the strong section.
        spans=[(0, 62), (78, 96)],
        env=[(0, 0.74), (28, 0.83), (55, 0.94), (78, 1.0), (81, 1.0)],
        note='dip at 1:05-1:15 cut; now ends on its strongest section'),
}


def run(letter):
    e = EDITS[letter]
    src = os.path.join(WORK, '%s.wav' % e['src'])
    s, ch, rate = audio.read_wav(src)
    orig = audio.frames(s, ch) / rate

    out = splice(s, ch, rate, e['spans'])
    out = audio.envelope(out, ch, rate, e['env'])
    out = audio.fade(out, ch, rate, fade_in=0.6, fade_out=3.0)

    wav = os.path.join(WORK, '%s.wav' % e['out'])
    audio.write_wav(wav, out, ch, rate)
    dur = audio.frames(out, ch) / rate
    prof = audio.energy_profile(out, ch, rate, window=5.0)
    print('%s  %-16s %5.1fs -> %5.1fs   new range %.1f dB   %s'
          % (letter, e['src'], orig, dur, max(prof) - min(prof), e['note']))
    return wav, e['out']


def main():
    want = [a.upper() for a in sys.argv[1:]] or sorted(EDITS)
    made = []
    for L in want:
        if L in EDITS:
            made.append(run(L))
    print('\nencoding...')
    for wav, name in made:
        m4a = os.path.join(DEST, '%s.m4a' % name)
        os.system('afconvert -f m4af -d aac -b 160000 "%s" "%s"' % (wav, m4a))
        print('  wrote music/%s.m4a  (%.1f MB)' % (name, os.path.getsize(m4a) / 1048576))


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
'Village Theme' — an ORIGINAL melody for Village War, played by real instruments.

The trick (the user's idea): we don't own an orchestra, but almost every note we
need has already been played by one somewhere in the soundtrack. So:

    harvest single clean notes from the recordings  (notes.py)
      -> label them by pitch, build a sampled instrument   (sampler.py)
        -> sequence a melody WE wrote                      (this file)

The tune is ours. The timbre is a real lute/harp/strings. Nothing is copied —
individual notes are not a copyrightable melody, and the melody here is new.

Pitch coverage comes from four tracks pooled together; any one track alone only
yields ~9 usable pitches, which forces big resampling jumps and sounds synthetic.
Pooled, we get 24 pitches from A2 to D6, so nothing resamples more than a
semitone or two.

    python3 tools/compose.py            # uses cached note bank if present
    python3 tools/compose.py --fresh    # re-harvest from the WAVs (slow, ~3 min)
"""
import array, os, pickle, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audio, notes as N, sampler

WORK = '/tmp/vwaudio'
CACHE = os.path.join(WORK, 'notebank.pkl')
SOURCES = ['angevin', 'kml-minstrel', 'kml-teller', 'kml-thatched']
OUT = os.path.join(WORK, 'village-theme.wav')

# ---------------------------------------------------------------- note names
A2, As2, C3, D3, E3, F3, G3, A3, B3 = 45, 46, 48, 50, 52, 53, 55, 57, 59
C4, D4, E4, F4, G4, A4, B4 = 60, 62, 64, 65, 67, 69, 71
C5, D5, E5, F5, G5, A5 = 72, 74, 76, 77, 79, 81
R = None                                     # rest

BPM = 76                                     # ~3.16s per 4/4 bar

# ------------------------------------------------------------------ the tune
# A minor, stepwise, singable — deliberately simple. A sampled instrument with
# reverb bleed in every note flatters sparse writing and exposes busy writing,
# so the arrangement leans on space rather than density.

THEME = [                                    # 8 bars — the main melody
    (A4, 2), (C5, 2),
    (B4, 2), (A4, 2),
    (E4, 2), (F4, 2),
    (E4, 4),
    (A4, 2), (C5, 2),
    (E5, 2), (D5, 2),
    (C5, 2), (B4, 2),
    (A4, 4),
]

BRIDGE = [                                   # 8 bars — contrast, rises then falls
    (F4, 2), (A4, 2),
    (C5, 4),
    (G4, 2), (B4, 2),
    (D5, 4),
    (C5, 2), (B4, 2),
    (A4, 2), (G4, 2),
    (F4, 2), (E4, 2),
    (D4, 4),
]

CODA = [                                     # 4 bars — the theme's last line, slower
    (A4, 4),
    (C5, 4),
    (E4, 4),
    (A4, 8),                                 # final note left to ring
]

# Bass: one root per bar, moving under the melody.
BASS_THEME = [(A2, 4), (A2, 4), (E3, 4), (E3, 4), (A2, 4), (F3, 4), (G3, 4), (A2, 4)]
BASS_BRIDGE = [(F3, 4), (F3, 4), (G3, 4), (G3, 4), (C3, 4), (C3, 4), (D3, 4), (E3, 4)]
BASS_CODA = [(A2, 4), (F3, 4), (E3, 4), (A2, 8)]

INTRO_BARS = 4
BASS_INTRO = [(A2, 4), (A2, 4), (E3, 4), (E3, 4)]
LEAD_INTRO = [(R, 16)]                       # drone alone for four bars


def harmony(melody, drop=3):
    """A companion line a third below — same rhythm, thinned out.

    Playing it on every note muddies the sampled timbre, so we voice it only on
    the downbeat of each pair and rest through the rest.
    """
    out = []
    for i, (m, b) in enumerate(melody):
        if m is None or i % 2:
            out.append((R, b))
        else:
            out.append((m - drop, b))
    return out


def build(inst):
    lead = (LEAD_INTRO + THEME + THEME + BRIDGE + THEME + CODA)
    bass = (BASS_INTRO + BASS_THEME * 2 + BASS_BRIDGE + BASS_THEME + BASS_CODA)
    # Harmony enters only on the second statement and the finale — so the tune
    # is heard plain first, then thickens. That's the arc the flat source tracks
    # were criticised for lacking.
    harm = ([(R, 16)] + [(R, 32)] + harmony(THEME) + [(R, 32)]
            + harmony(THEME) + harmony(CODA))

    l = sampler.sequence(inst, lead, bpm=BPM, gain=0.92)
    b = sampler.sequence(inst, bass, bpm=BPM, gain=0.40)
    h = sampler.sequence(inst, harm, bpm=BPM, gain=0.34)
    mixed = sampler.mix(sampler.mix(l, b, gain_b=0.55), h, gain_b=0.5)
    return mixed


def load_bank(fresh=False):
    if not fresh and os.path.exists(CACHE):
        with open(CACHE, 'rb') as f:
            return pickle.load(f)

    bank, ch, rate = {}, 2, 44100
    for name in SOURCES:
        path = os.path.join(WORK, '%s.wav' % name)
        if not os.path.exists(path):
            print('  skip %s (no wav)' % name)
            continue
        got, ch, rate = N.harvest(path, want=40, min_clarity=0.42)
        s, _, _ = audio.read_wav(path)
        for c in got:
            m = c['midi']
            if m in bank and bank[m][0] >= c['clarity']:
                continue                     # keep the cleanest capture per pitch
            seg = sampler.grab(s, ch, rate, c['t'])
            if seg:
                bank[m] = (c['clarity'], seg)
        print('  %-14s %2d notes -> bank %d' % (name, len(got), len(bank)))
    bank = {m: v[1] for m, v in bank.items()}
    with open(CACHE, 'wb') as f:
        pickle.dump((bank, ch, rate), f)
    return bank, ch, rate


class Bank(sampler.Instrument):
    """Instrument fed from a pre-pooled bank instead of a single file."""

    def __init__(self, bank, ch, rate):
        self.bank, self.ch, self.rate = bank, ch, rate
        self.pitches = sorted(bank)
        self._cache = {}


def main():
    bank, ch, rate = load_bank('--fresh' in sys.argv)
    print('bank: %d pitches — %s' % (len(bank), ', '.join(N.note_name(m) for m in sorted(bank))))
    inst = Bank(bank, ch, rate)

    mixed = build(inst)
    mixed = audio.fade(mixed, ch, rate, fade_in=0.5, fade_out=3.5)
    audio.write_wav(OUT, mixed, ch, rate)

    peak = max(abs(v) for v in mixed)
    print('wrote %s — %.1fs, peak %.1f%% (%s)'
          % (OUT, audio.frames(mixed, ch) / rate, peak / 327.68,
             'clipping!' if peak >= 32767 else 'headroom ok'))


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
A plucked-string instrument built from physical modelling — lute / harp / psaltery.

Why this instead of sampling: chopping notes out of the finished soundtrack failed
because those slices carry the original chords and room with them. This models the
string itself, so every note is clean, in tune, and ours.

Karplus-Strong in one sentence: fill a delay line the length of one wave period
with noise (the pluck), then feed it back through a low-pass filter. The noise
immediately organises into a harmonic series at 1/period Hz, and because the
filter removes highs on every pass, the upper harmonics die faster than the
fundamental — which is exactly what a real string does, and the single biggest
reason this sounds like an instrument and a sine wave does not.

On top of the raw string, three things that separate "synth" from "instrument":

  * fractional-delay tuning  — an integer delay line can only play the pitches
    that divide evenly into the sample rate; everything else lands sharp. We
    interpolate, so the tuning is actually correct (verified in main()).
  * a soundbox              — real instruments colour their output through fixed
    body resonances. Without these the string sounds naked and electronic.
  * humanisation            — micro-variation in timing, level and brightness.
    Machine-perfect repetition is one of the loudest "this is fake" cues.

Everything here is pure stdlib, so it is slow but dependency-free.
"""
import array, math, os, random, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import audio


# ----------------------------------------------------------------- the string
def pluck(freq, dur, rate=44100, brightness=0.5, damping=0.996, level=1.0):
    """One plucked note. Returns a float list.

    brightness  0..1  — how hard/bright the pluck is (pick attack, harmonic content)
    damping     0..1  — how long it rings; lower = deader string
    """
    # Total loop delay must equal one wave period. Two things contribute besides
    # the delay line: the two-point averaging loop filter contributes exactly 0.5
    # samples of phase delay, and the all-pass contributes `frac`. Ignoring the
    # 0.5 makes every note flat, and worse as pitch rises (the error is a bigger
    # fraction of a shorter delay line) — measured at -64 cents by A5.
    period = rate / float(freq) - 0.5
    n_int = int(period)
    frac = period - n_int
    # The all-pass is only well behaved for frac in roughly [0.1, 1.1].
    if frac < 0.1:
        n_int -= 1
        frac += 1.0
    if n_int < 2:
        return [0.0] * int(dur * rate)

    # --- excitation: filtered noise, shaped by how hard the string is struck.
    # A soft pluck excites mostly low harmonics; a hard one excites everything.
    buf = [random.uniform(-1.0, 1.0) for _ in range(n_int)]
    smooth = 1.0 - brightness            # 0 = raw noise (bright), 1 = very dark
    for _ in range(int(smooth * 6)):     # repeated averaging = gentle low-pass
        buf = [(buf[i] + buf[i - 1]) * 0.5 for i in range(len(buf))]

    # Pick-position comb: a string plucked at 1/5 of its length has a notch in
    # the harmonic series. Real, audible, and cheap.
    pick = max(1, int(n_int * 0.22))
    buf = [buf[i] - buf[i - pick] * 0.62 for i in range(len(buf))]

    out = [0.0] * int(dur * rate)
    # First-order all-pass, y[n] = a*x[n] + x[n-1] - a*y[n-1], which delays by
    # `frac` samples without changing the magnitude of any harmonic.
    a = (1.0 - frac) / (1.0 + frac)
    ap_x1 = ap_y1 = 0.0
    prev = 0.0
    idx = 0
    L = len(buf)
    for i in range(len(out)):
        cur = buf[idx]
        # loop filter: two-point average = frequency-dependent decay (highs die first)
        lp = (cur + prev) * 0.5 * damping
        prev = cur
        ap_y1 = a * lp + ap_x1 - a * ap_y1
        ap_x1 = lp
        buf[idx] = ap_y1
        out[i] = cur
        idx += 1
        if idx >= L:
            idx = 0

    # Level + a short fade-out so notes never click when they are cut off.
    tail = min(int(0.03 * rate), len(out))
    for i in range(len(out)):
        g = level
        if i > len(out) - tail:
            g *= (len(out) - i) / float(tail)
        out[i] *= g
    return out


# ------------------------------------------------------------------ soundbox
def biquad(x, b0, b1, b2, a1, a2):
    y = [0.0] * len(x)
    x1 = x2 = y1 = y2 = 0.0
    for n in range(len(x)):
        xn = x[n]
        v = b0 * xn + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        x2, x1 = x1, xn
        y2, y1 = y1, v
        y[n] = v
    return y


def peak(x, rate, freq, q, gain_db):
    """Resonant peaking EQ — one body mode."""
    A = 10 ** (gain_db / 40.0)
    w = 2 * math.pi * freq / rate
    al = math.sin(w) / (2 * q)
    c = math.cos(w)
    a0 = 1 + al / A
    return biquad(x, (1 + al * A) / a0, (-2 * c) / a0, (1 - al * A) / a0,
                  (-2 * c) / a0, (1 - al / A) / a0)


def soundbox(x, rate):
    """Fixed resonances of a wooden body. These frequencies are roughly those of
    a lute-family instrument: air (Helmholtz) mode, top-plate mode, and two
    higher modes that give it 'wood' rather than 'wire'."""
    x = peak(x, rate, 118.0, 1.1, 5.5)     # air resonance — warmth
    x = peak(x, rate, 258.0, 1.4, 4.0)     # top plate — body
    x = peak(x, rate, 520.0, 2.2, 2.5)     # lower midrange
    x = peak(x, rate, 1180.0, 2.8, -3.0)   # scoop the boxy honk
    x = peak(x, rate, 2600.0, 1.6, 2.0)    # pick definition
    return x


# -------------------------------------------------------------------- reverb
def reverb(x, rate, mix=0.28, room=0.82):
    """Schroeder reverb: parallel combs make the density, series all-passes
    smear it so it stops sounding like discrete echoes."""
    combs = [(0.0297, room), (0.0371, room - 0.02),
             (0.0411, room - 0.035), (0.0437, room - 0.05)]
    acc = [0.0] * len(x)
    for delay, fb in combs:
        d = int(delay * rate)
        buf = [0.0] * d
        i = 0
        damp = 0.0
        for n in range(len(x)):
            v = buf[i]
            acc[n] += v
            damp = v * 0.62 + damp * 0.38          # damped comb: highs decay first
            buf[i] = x[n] + damp * fb
            i += 1
            if i >= d:
                i = 0
    acc = [v * 0.25 for v in acc]
    for delay, g in ((0.0050, 0.7), (0.0017, 0.7)):
        d = int(delay * rate)
        buf = [0.0] * d
        i = 0
        for n in range(len(acc)):
            v = buf[i]
            out = -g * acc[n] + v
            buf[i] = acc[n] + g * out
            acc[n] = out
            i += 1
            if i >= d:
                i = 0
    return [x[n] * (1 - mix) + acc[n] * mix for n in range(len(x))]


# ----------------------------------------------------------------- sequencing
def midi_hz(m):
    return 440.0 * (2 ** ((m - 69) / 12.0))


def render(events, rate=44100, tail=3.0, humanise=True):
    """events = [(start_beat, midi, beats, velocity), ...] in beats; caller sets bpm
    by passing already-converted seconds. Returns a float list."""
    total = max(e[0] + e[2] for e in events) + tail
    out = [0.0] * int(total * rate)
    for start, m, dur, vel in events:
        if humanise:
            start += random.uniform(-0.012, 0.012)      # not machine-tight
            vel *= random.uniform(0.88, 1.08)           # not machine-even
            cents = random.uniform(-4, 4)               # not machine-perfect pitch
        else:
            cents = 0.0
        f = midi_hz(m) * (2 ** (cents / 1200.0))
        # Harder notes are brighter — the single most important dynamic cue.
        br = min(0.92, 0.34 + vel * 0.45)
        # Low strings ring longer than high ones, as on a real instrument.
        damp = 0.9975 if m < 55 else (0.9965 if m < 67 else 0.9950)
        note = pluck(f, dur + 1.9, rate, brightness=br, damping=damp, level=vel)
        base = int(max(0.0, start) * rate)
        for i, v in enumerate(note):
            j = base + i
            if j >= len(out):
                break
            out[j] += v
    return out


def to_stereo_pcm(x, rate, width=0.012):
    """Widen mono to stereo with a small delay, then convert to 16-bit."""
    d = int(width * rate)
    peak_v = max(abs(v) for v in x) or 1.0
    g = 0.92 / peak_v
    n = len(x)
    pcm = array.array('h', bytes(n * 2 * 2))
    for i in range(n):
        l = x[i] * g
        r = (x[i - d] if i >= d else 0.0) * g * 0.72 + x[i] * g * 0.28
        pcm[i * 2] = max(-32768, min(32767, int(l * 32767)))
        pcm[i * 2 + 1] = max(-32768, min(32767, int(r * 32767)))
    return pcm


# ------------------------------------------------------------------- the tune
# D Dorian — the mode most associated with medieval and folk music. Written for
# harp: a singing top line over a rolling arpeggio, which is what the instrument
# actually does well.
D3, E3, F3, G3, A3, B3, C4 = 50, 52, 53, 55, 57, 59, 60
D4, E4, F4, G4, A4, B4, C5, D5 = 62, 64, 65, 67, 69, 71, 72, 74

MELODY = [                          # (beat, midi, beats, velocity)
    (0, D4, 1, .80), (1, F4, 1, .72), (2, A4, 2, .86),
    (4, G4, 1, .70), (5, F4, 1, .68), (6, E4, 2, .74),
    (8, D4, 1, .78), (9, F4, 1, .72), (10, A4, 1, .84), (11, C5, 1, .80),
    (12, B4, 1, .74), (13, A4, 1, .70), (14, G4, 2, .72),
    (16, A4, 1, .82), (17, C5, 1, .78), (18, D5, 2, .90),
    (20, C5, 1, .74), (21, B4, 1, .70), (22, A4, 2, .78),
    (24, F4, 1, .70), (25, E4, 1, .66), (26, D4, 1, .72), (27, E4, 1, .68),
    (28, D4, 4, .76),
]

# Rolling arpeggio underneath — the harp's left hand.
ARP_CHORDS = [(0, [D3, A3, D4]), (4, [D3, A3, C4]), (8, [D3, A3, D4]),
              (12, [G3, D4, G4]), (16, [F3, C4, F4]), (20, [D3, A3, D4]),
              (24, [G3, D4, F4]), (28, [D3, A3, D4])]


def build_events(bpm=72):
    spb = 60.0 / bpm
    ev = []
    for beat, m, dur, vel in MELODY:
        ev.append((beat * spb, m, dur * spb, vel))
    for beat, chord in ARP_CHORDS:
        for k in range(8):                       # eight rolled notes per bar
            m = chord[k % len(chord)] + (12 if k >= len(chord) * 1 and k % 3 == 2 else 0)
            ev.append(((beat + k * 0.5) * spb, m, 0.5 * spb, 0.34))
    return ev


def main():
    random.seed(7)                               # reproducible renders
    rate = 44100
    out_wav = '/tmp/vwaudio/harp-demo.wav'

    # --- verify the string is actually in tune before trusting the piece ---
    import notes as N
    print('tuning check (Karplus-Strong with fractional delay):')
    worst = 0.0
    for m in (45, 52, 57, 64, 69, 76, 81):
        s = pluck(midi_hz(m), 1.2, rate, brightness=0.5)
        mono = array.array('h', [max(-32768, min(32767, int(v * 22000))) for v in s])
        hz, clar = N.detect_pitch(mono, rate, 0.05, dur=0.5, fmin=60.0, fmax=1400.0)
        want = midi_hz(m)
        cents = 1200 * math.log2(hz / want) if hz > 0 else 999
        worst = max(worst, abs(cents))
        print('   %-4s want %7.2fHz  got %7.2fHz  %+6.1f cents  clarity %.2f'
              % (N.note_name(m), want, hz, cents, clar))
    print('   worst error: %.1f cents (>25 would be audibly out of tune)\n' % worst)

    print('rendering...')
    x = render(build_events(bpm=72), rate=rate)
    print('  soundbox...')
    x = soundbox(x, rate)
    print('  reverb...')
    x = reverb(x, rate)
    pcm = to_stereo_pcm(x, rate)
    audio.write_wav(out_wav, pcm, 2, rate)
    print('wrote %s — %.1fs' % (out_wav, len(x) / float(rate)))


if __name__ == '__main__':
    main()

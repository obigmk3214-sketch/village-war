#!/usr/bin/env python3
"""
Note extraction: find individual note onsets in a recording, detect their pitch,
and build a playable sampled instrument from them.

The idea (user's): every note we need has already been played by a real
instrument somewhere in the soundtrack. If we can isolate clean notes and label
them by pitch, we can sequence them into NEW melodies that still sound like the
real instruments rather than like an oscillator.

Reality check baked into the scoring below: these recordings are polyphonic and
reverberant, so a "clean" note is really a moment where one note dominates. We
score candidates on how strongly a single pitch stands out and how much the
level rises at the onset, then keep only the best.
"""
import math, array, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import audio

A4 = 440.0
NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']


def midi_to_hz(m):
    return A4 * (2 ** ((m - 69) / 12))


def hz_to_midi(f):
    return 69 + 12 * math.log2(f / A4) if f > 0 else 0


def note_name(m):
    m = int(round(m))
    return '%s%d' % (NAMES[m % 12], m // 12 - 1)


def mono(samples, channels):
    if channels == 1:
        return samples
    out = array.array('h', bytes(len(samples) // channels * 2))
    for i in range(len(out)):
        out[i] = (samples[i * channels] + samples[i * channels + 1]) // 2
    return out


def onsets(m, rate, hop=0.02, thresh=1.7):
    """Return times (s) where short-term energy jumps — i.e. a note is struck."""
    h = int(hop * rate)
    env = []
    for i in range(0, len(m) - h, h):
        s = 0
        for k in range(i, i + h, 4):
            v = m[k]
            s += v * v
        env.append(math.sqrt(s / max(1, h // 4)))
    out = []
    for i in range(2, len(env) - 1):
        prev = max(env[i - 1], 1.0)
        if env[i] / prev > thresh and env[i] > 400:
            out.append(i * hop)
    return out


def detect_pitch(m, rate, t0, dur=0.25, fmin=110.0, fmax=1200.0):
    """Autocorrelation pitch detection over a short window.

    Returns (hz, clarity 0..1). Clarity is the normalised autocorrelation peak —
    low clarity means the window is a chord or noise rather than one note.
    """
    i0 = int(t0 * rate)
    n = int(dur * rate)
    if i0 + n >= len(m):
        return 0.0, 0.0
    w = [float(m[i0 + i]) for i in range(0, n, 2)]     # decimate 2x for speed
    r = rate / 2
    w = [v - sum(w) / len(w) for v in w]
    lo, hi = int(r / fmax), int(r / fmin)
    best, best_lag, zero = 0.0, 0, sum(v * v for v in w) or 1.0
    for lag in range(lo, min(hi, len(w) - 1)):
        s = 0.0
        for i in range(0, len(w) - lag, 3):
            s += w[i] * w[i + lag]
        s *= 3
        if s > best:
            best, best_lag = s, lag
    if best_lag == 0:
        return 0.0, 0.0
    return r / best_lag, max(0.0, min(1.0, best / zero))


def harvest(path, want=24, min_clarity=0.35):
    """Scan a track and return the cleanest single notes it can find."""
    s, ch, rate = audio.read_wav(path)
    m = mono(s, ch)
    cands = []
    for t in onsets(m, rate):
        hz, clar = detect_pitch(m, rate, t + 0.03)
        if hz <= 0 or clar < min_clarity:
            continue
        midi = hz_to_midi(hz)
        # reject anything far from equal temperament — usually a chord blur
        off = abs(midi - round(midi))
        if off > 0.22:
            continue
        cands.append({'t': round(t, 3), 'hz': round(hz, 1),
                      'midi': int(round(midi)), 'name': note_name(midi),
                      'clarity': round(clar, 3)})
    cands.sort(key=lambda c: -c['clarity'])
    return cands[:want], ch, rate


if __name__ == '__main__':
    got, ch, rate = harvest(sys.argv[1])
    print('found %d clean notes' % len(got))
    for c in got[:20]:
        print('  %7.2fs  %-4s %7.1fHz  clarity %.2f' % (c['t'], c['name'], c['hz'], c['clarity']))

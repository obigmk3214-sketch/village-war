#!/usr/bin/env python3
"""
Build a playable sampled instrument out of notes harvested from the soundtrack,
then sequence NEW melodies with it.

So the melody is genuinely new (we choose the notes), but every sound you hear
was played by the real instruments in the original recordings.

Limits worth knowing: the sources are polyphonic and reverberant, so each sample
carries a little of whatever else was sounding. Resampling covers pitches we
never captured, but beyond ~4 semitones it starts to sound artificial, so we
always pick the nearest captured note as the source.
"""
import array, math, sys
sys.path.insert(0, __file__.rsplit('/', 1)[0])
import audio, notes


def grab(samples, channels, rate, t, dur=0.9, attack=0.006, release=0.35):
    """Cut a note starting at `t` and shape it so it starts and ends cleanly."""
    seg = audio.slice_sec(samples, channels, rate, t, t + dur)
    n = audio.frames(seg, channels)
    if n < 100:
        return None
    a = max(1, int(attack * rate))
    r = max(1, int(release * rate))
    for f in range(n):
        g = 1.0
        if f < a:
            g = f / a                                  # remove the click
        elif f > n - r:
            g = max(0.0, (n - f) / r)                  # decay out
        base = f * channels
        for c in range(channels):
            seg[base + c] = int(seg[base + c] * g)
    return seg


def resample(seg, channels, ratio):
    """Linear-interpolated resample. ratio>1 raises pitch (and shortens)."""
    n = audio.frames(seg, channels)
    out_n = max(1, int(n / ratio))
    out = array.array('h', bytes(out_n * channels * 2))
    for f in range(out_n):
        src = f * ratio
        i0 = int(src)
        frac = src - i0
        i1 = min(i0 + 1, n - 1)
        for c in range(channels):
            v = seg[i0 * channels + c] * (1 - frac) + seg[i1 * channels + c] * frac
            out[f * channels + c] = int(v)
    return out


class Instrument:
    """Maps MIDI pitch -> audio, resampling from the nearest captured note."""

    def __init__(self, wav_path, want=24):
        got, ch, rate = notes.harvest(wav_path, want=want)
        s, _, _ = audio.read_wav(wav_path)
        self.ch, self.rate = ch, rate
        self.bank = {}
        for c in got:
            if c['midi'] in self.bank:
                continue
            seg = grab(s, ch, rate, c['t'])
            if seg:
                self.bank[c['midi']] = seg
        self.pitches = sorted(self.bank)

    def note(self, midi, dur):
        """Render one note at `midi` for `dur` seconds."""
        if not self.pitches:
            return array.array('h')
        # Resampling is a per-sample Python loop, and an arrangement reuses the
        # same handful of pitches dozens of times — so do it once per pitch.
        seg = getattr(self, '_cache', {}).get(midi)
        if seg is None:
            src = min(self.pitches, key=lambda p: abs(p - midi))
            seg = self.bank[src]
            if src != midi:
                seg = resample(seg, self.ch, 2 ** ((midi - src) / 12))
            self._cache = getattr(self, '_cache', {})
            self._cache[midi] = seg
        want = int(dur * self.rate)
        n = audio.frames(seg, self.ch)
        out = array.array('h', bytes(want * self.ch * 2))
        take = min(n, want)
        out[:take * self.ch] = seg[:take * self.ch]
        # short tail fade so consecutive notes don't click
        r = min(int(0.05 * self.rate), take)
        for f in range(r):
            g = (r - f) / r
            idx = (take - r + f) * self.ch
            for c in range(self.ch):
                out[idx + c] = int(out[idx + c] * g)
        return out


def sequence(inst, melody, bpm=96, gain=0.9):
    """melody = [(midi|None, beats), ...]  -> rendered audio (None = rest)."""
    spb = 60.0 / bpm
    total = sum(b for _, b in melody) * spb
    out = array.array('h', bytes(int(total * inst.rate) * inst.ch * 2))
    pos = 0.0
    for midi, beats in melody:
        dur = beats * spb
        if midi is not None:
            seg = inst.note(midi, dur * 1.6)          # let notes ring over
            base = int(pos * inst.rate) * inst.ch
            for i in range(len(seg)):
                j = base + i
                if j >= len(out):
                    break
                v = out[j] + int(seg[i] * gain)
                out[j] = -32768 if v < -32768 else (32767 if v > 32767 else v)
        pos += dur
    return out


def mix(a, b, gain_b=0.6):
    """Layer b under a (for counter-melodies)."""
    out = array.array('h', a)
    for i in range(min(len(a), len(b))):
        v = out[i] + int(b[i] * gain_b)
        out[i] = -32768 if v < -32768 else (32767 if v > 32767 else v)
    return out

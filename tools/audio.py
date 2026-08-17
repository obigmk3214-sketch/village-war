#!/usr/bin/env python3
"""
Minimal WAV read/write + editing helpers for the Village War soundtrack.

afconvert (built into macOS) writes WAVE_FORMAT_EXTENSIBLE, which Python's
stdlib `wave` module refuses to open, so we parse the RIFF chunks ourselves and
always write back plain PCM (format 1) that every tool accepts.

Pipeline:
    afconvert -f WAVE -d LEI16 in.m4a out.wav     # decode
    ... edit here ...
    afconvert -f m4af -d aac -b <bitrate> out.wav final.m4a   # re-encode
"""
import struct, array, sys


def read_wav(path):
    """Return (samples:array('h') interleaved, channels, rate)."""
    with open(path, 'rb') as f:
        data = f.read()
    if data[:4] != b'RIFF' or data[8:12] != b'WAVE':
        raise ValueError('not a RIFF/WAVE file')
    pos, channels, rate, bits, pcm = 12, None, None, None, None
    while pos + 8 <= len(data):
        cid = data[pos:pos + 4]
        size = struct.unpack('<I', data[pos + 4:pos + 8])[0]
        body = data[pos + 8:pos + 8 + size]
        if cid == b'fmt ':
            # works for both PCM (16 bytes) and EXTENSIBLE (40 bytes)
            channels = struct.unpack('<H', body[2:4])[0]
            rate = struct.unpack('<I', body[4:8])[0]
            bits = struct.unpack('<H', body[14:16])[0]
        elif cid == b'data':
            pcm = body
        pos += 8 + size + (size & 1)          # chunks are word-aligned
    if pcm is None or channels is None:
        raise ValueError('missing fmt/data chunk')
    if bits != 16:
        raise ValueError('expected 16-bit, got %r' % bits)
    a = array.array('h')
    a.frombytes(pcm[:len(pcm) - (len(pcm) % 2)])
    return a, channels, rate


def write_wav(path, samples, channels, rate):
    """Write plain 16-bit PCM WAV (format 1)."""
    raw = samples.tobytes()
    hdr = b'RIFF' + struct.pack('<I', 36 + len(raw)) + b'WAVE'
    hdr += b'fmt ' + struct.pack('<IHHIIHH', 16, 1, channels, rate,
                                 rate * channels * 2, channels * 2, 16)
    hdr += b'data' + struct.pack('<I', len(raw))
    with open(path, 'wb') as f:
        f.write(hdr + raw)


def frames(samples, channels):
    return len(samples) // channels


def slice_sec(samples, channels, rate, t0, t1):
    """Cut [t0, t1) seconds, snapped to frame boundaries."""
    i0 = max(0, int(t0 * rate)) * channels
    i1 = min(frames(samples, channels), int(t1 * rate)) * channels
    return samples[i0:i1]


def gain(samples, factor):
    out = array.array('h', bytes(len(samples) * 2))
    for i, v in enumerate(samples):
        x = int(v * factor)
        out[i] = -32768 if x < -32768 else (32767 if x > 32767 else x)
    return out


def crossfade(a, b, channels, rate, secs):
    """Blend the tail of `a` into the head of `b` with an equal-power curve."""
    import math
    n = min(int(secs * rate), frames(a, channels), frames(b, channels))
    if n <= 0:
        return a + b
    head = a[:len(a) - n * channels]
    out = array.array('h', head)
    tail_a = a[len(a) - n * channels:]
    head_b = b[:n * channels]
    blended = array.array('h', bytes(n * channels * 2))
    for f in range(n):
        p = f / n
        ga, gb = math.cos(p * math.pi / 2), math.sin(p * math.pi / 2)
        for c in range(channels):
            k = f * channels + c
            x = int(tail_a[k] * ga + head_b[k] * gb)
            blended[k] = -32768 if x < -32768 else (32767 if x > 32767 else x)
    out.extend(blended)
    out.extend(b[n * channels:])
    return out


def energy_profile(samples, channels, rate, window=1.0):
    """RMS per `window` seconds — used to find where a track builds or sags."""
    import math
    step = int(window * rate) * channels
    prof = []
    for i in range(0, len(samples) - step + 1, step):
        s = 0
        for k in range(i, i + step, channels * 16):   # sparse but consistent
            v = samples[k]
            s += v * v
        n = max(1, len(range(i, i + step, channels * 16)))
        prof.append(round(20 * math.log10(math.sqrt(s / n) / 32768 + 1e-9), 1))
    return prof


if __name__ == '__main__':
    s, ch, rate = read_wav(sys.argv[1])
    print('channels', ch, 'rate', rate, 'secs', round(frames(s, ch) / rate, 1))


def envelope(samples, channels, rate, points):
    """Apply a gain curve. `points` = [(seconds, gain), ...], linearly interpolated.

    Used to impose a dynamic arc on recordings that are mastered flat — several
    of these tracks vary by under 4 dB end to end, which is what makes them feel
    static however long you listen.
    """
    import array
    out = array.array('h', bytes(len(samples) * 2))
    n = frames(samples, channels)
    pts = sorted(points)
    for f in range(n):
        t = f / rate
        g = pts[-1][1]
        for i in range(len(pts) - 1):
            t0, g0 = pts[i]
            t1, g1 = pts[i + 1]
            if t0 <= t <= t1:
                p = 0 if t1 == t0 else (t - t0) / (t1 - t0)
                g = g0 + (g1 - g0) * p
                break
        else:
            if t < pts[0][0]:
                g = pts[0][1]
        base = f * channels
        for c in range(channels):
            x = int(samples[base + c] * g)
            out[base + c] = -32768 if x < -32768 else (32767 if x > 32767 else x)
    return out


def fade(samples, channels, rate, fade_in=0.0, fade_out=0.0):
    """Linear fade in/out at the edges, in seconds."""
    n = frames(samples, channels)
    fi = int(fade_in * rate)
    fo = int(fade_out * rate)
    for f in range(fi):
        g = f / max(1, fi)
        for c in range(channels):
            samples[f * channels + c] = int(samples[f * channels + c] * g)
    for f in range(fo):
        g = f / max(1, fo)
        idx = n - 1 - f
        for c in range(channels):
            samples[idx * channels + c] = int(samples[idx * channels + c] * g)
    return samples

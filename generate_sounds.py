import numpy as np
import wave
import struct

sr = 44100

def save_wav(filename, data):
    # Normalize to 16-bit PCM
    data = data / (np.max(np.abs(data)) + 1e-6)
    data = (data * 32000).astype(np.int16)
    with wave.open(filename, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(sr)
        f.writeframes(data.tobytes())

# 1. Woolwich Ferry Horn: Deep, resonant maritime fog horn (approx 110 Hz / 165 Hz / 220 Hz with natural rumble, slow attack and cavernous decay)
duration = 3.5
t = np.linspace(0, duration, int(sr * duration), False)
# Fundamental around 108Hz, rich brassy low harmonics
f0 = 108.0
horn = (
    1.0 * np.sin(2 * np.pi * f0 * t) +
    0.75 * np.sin(2 * np.pi * (f0 * 1.5) * t) +
    0.6 * np.sin(2 * np.pi * (f0 * 2.0) * t) +
    0.4 * np.sin(2 * np.pi * (f0 * 2.5) * t) +
    0.3 * np.sin(2 * np.pi * (f0 * 3.0) * t) +
    0.15 * np.sin(2 * np.pi * (f0 * 4.0) * t) +
    0.08 * np.random.normal(0, 0.5, len(t)) # air rush / steam texture
)
# Slight pitch drop as steam pressure stabilizes
pitch_env = np.exp(-t * 0.15)
horn_mod = np.sin(2 * np.pi * (f0 * (1.0 + 0.03 * pitch_env)) * t) + 0.6 * np.sin(2 * np.pi * (f0 * 1.5 * (1.0 + 0.02 * pitch_env)) * t)
horn = horn * 0.5 + horn_mod * 0.5

# Envelope: gentle swell attack (0.4s), steady sustained blast, reverberant release
envelope = np.ones_like(t)
attack_samples = int(sr * 0.45)
envelope[:attack_samples] = np.sin(np.linspace(0, np.pi/2, attack_samples))
release_samples = int(sr * 1.0)
envelope[-release_samples:] = np.linspace(1, 0, release_samples) ** 1.8

ferry_horn = horn * envelope
save_wav('/home/fd/Cursor/Agent/dlr-driver-console/public/sounds/woolwich_ferry.wav', ferry_horn)
print("Ferry horn generated")

# 2. Bow Church Bells: Realistic carillon / church peal / change ringing (St Mary-le-Bow bells strike)
# Church bells have characteristic strike tone, hum tone (octave below), tierce (minor third), quint (fifth), and nominal.
def bell_strike(strike_time, fundamental_freq, strike_amp=1.0):
    bell_sig = np.zeros_like(t)
    start_idx = int(strike_time * sr)
    if start_idx >= len(t):
        return bell_sig
    sub_t = t[start_idx:] - strike_time
    
    # Bell partial frequencies (hum, prime, tierce, quint, nominal, superquint)
    partials = [
        (0.5, 0.8, 4.0),   # Hum tone (half freq, slow decay)
        (1.0, 1.0, 2.5),   # Prime / fundamental
        (1.2, 0.6, 2.0),   # Tierce (minor 3rd)
        (1.5, 0.5, 1.8),   # Quint
        (2.0, 0.7, 1.2),   # Nominal
        (2.6, 0.3, 0.8),   # Superquint
        (3.0, 0.2, 0.6)    # Decima
    ]
    tone = np.zeros_like(sub_t)
    for ratio, amp, decay in partials:
        freq = fundamental_freq * ratio
        tone += amp * np.sin(2 * np.pi * freq * sub_t) * np.exp(-sub_t * (decay * 0.8))
        
    # Strike transient metallic clapper click
    clapper = np.random.normal(0, 0.5, len(sub_t)) * np.exp(-sub_t * 80.0) * 0.4
    bell_sig[start_idx:] = (tone + clapper) * strike_amp
    return bell_sig

# Traditional Westminster / Bow chime sequence: D4, F#4, A4, G4, D5 peal
chimes_dur = 4.2
t = np.linspace(0, chimes_dur, int(sr * chimes_dur), False)
bells = np.zeros_like(t)
pitches = [587.33, 493.88, 440.0, 392.0] # D5, B4, A4, G4 (classic Bow bells peal notes)
delays = [0.05, 0.7, 1.35, 2.05]

for delay, pitch in zip(delays, pitches):
    bells += bell_strike(delay, pitch, strike_amp=0.9)

save_wav('/home/fd/Cursor/Agent/dlr-driver-console/public/sounds/bow_church_bells.wav', bells)
print("Bow church bells generated")

# 3. High Speed Warp Sound effect: Sci-Fi Star Wars Hyperdrive spin-up & warp blast!
warp_dur = 4.0
t = np.linspace(0, warp_dur, int(sr * warp_dur), False)
# Accelerating tone sweep + whoosh + sub-bass punch
f_start = 80.0
f_end = 2400.0
# Exponential frequency rise
freq_sweep = f_start * (f_end / f_start) ** (t / 2.2)
phase = 2 * np.pi * np.cumsum(freq_sweep) / sr

# Engine pulse rate accelerating
pulse_rate = 5.0 + 35.0 * (t / 2.5) ** 2
pulse = (0.5 + 0.5 * np.sin(2 * np.pi * np.cumsum(pulse_rate) / sr))

noise = np.random.normal(0, 0.4, len(t))
# Low pass filtered whoosh
whoosh_env = (t / 2.5) ** 3
whoosh_env[t > 2.5] = np.exp(-(t[t > 2.5] - 2.5) * 4.0)

warp = (np.sin(phase) * 0.7 + np.sin(phase * 0.5) * 0.5) * pulse * (1.0 - np.exp(-t * 2.0))
# Explosive warp boom at t=2.3
boom_t = np.maximum(0, t - 2.2)
boom = np.sin(2 * np.pi * 55.0 * np.exp(-boom_t * 1.5) * boom_t) * np.exp(-boom_t * 2.5) * 1.5
warp_sfx = (warp * 0.6 + noise * whoosh_env * 0.4 + boom * 0.7)

save_wav('/home/fd/Cursor/Agent/dlr-driver-console/public/sounds/hyperdrive_warp.wav', warp_sfx)
print("Hyperdrive warp generated")

# 4. Authentic DLR Dual-Tone Chime before announcements ("Bing Bong")
chime_dur = 1.4
t = np.linspace(0, chime_dur, int(sr * chime_dur), False)
chime = np.zeros_like(t)
# Tone 1: F#5 (740 Hz), Tone 2: D#5 (622 Hz)
chime += (np.sin(2 * np.pi * 740 * t) + 0.3 * np.sin(2 * np.pi * 1480 * t)) * np.exp(-t * 4.5)
t2_start = int(0.4 * sr)
t2 = t[t2_start:] - 0.4
chime[t2_start:] += (np.sin(2 * np.pi * 587 * t2) + 0.3 * np.sin(2 * np.pi * 1174 * t2)) * np.exp(-t2 * 3.5)
save_wav('/home/fd/Cursor/Agent/dlr-driver-console/public/sounds/dlr_bing_bong.wav', chime)
print("DLR Bing Bong chime generated")

"""Final mix + master.

voice (processed, -16 LUFS each)  ->  dialogue bus
music bed + drums                  ->  section automation x speech-keyed ducking (+ spectral dip under speech)
sfx stem (rendered by Remotion)    ->  ducked under speech, peaks tamed
master: gentle bus compression -> -16 LUFS integrated -> 4x oversampled limiter (true peak <= -1 dBTP)
"""
import json, re, subprocess, sys
import numpy as np
from scipy.io import wavfile
from scipy.signal import resample_poly

SR = 48000
A = "work/audio/"
DUR = 5340 / 30  # 178.0 s
N = int(round(DUR * SR))
OFF = {"bhawna": 270 / 30, "shreya": 1338 / 30, "arjun": 2856 / 30}  # scene starts (s)


def run(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + args, check=True)


def loud(path):
    o = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128=peak=true:framelog=quiet", "-f", "null", "-"],
                       capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", o)[-1]), float(re.findall(r"Peak:\s+(-?[\d.]+)", o)[-1])

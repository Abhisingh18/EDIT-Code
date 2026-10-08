# Runs inside work/audio/dfenv (numpy<2). DeepFilterNet3 speech enhancement, limited attenuation for natural tone.
import sys, types, warnings
warnings.filterwarnings("ignore")
# deepfilternet 0.5.6 imports a torchaudio module that no longer exists; stub it (we do our own I/O)
tb = types.ModuleType("torchaudio.backend"); tc = types.ModuleType("torchaudio.backend.common")
class AudioMetaData:  # noqa
    pass
tc.AudioMetaData = AudioMetaData; tb.common = tc
sys.modules["torchaudio.backend"] = tb; sys.modules["torchaudio.backend.common"] = tc
import numpy as np, torch
from scipy.io import wavfile
from df.enhance import enhance, init_df
model, state, _ = init_df(log_level="ERROR")
for n in ["arjun2"]:
    sr, x = wavfile.read(f"work/audio/raw_{n}.wav")
    assert sr == state.sr(), (sr, state.sr())
    a = torch.from_numpy(x.astype(np.float32) / 32768.0)[None]
    y = enhance(model, state, a, atten_lim_db=28.0)
    y = y.squeeze(0).numpy()
    wavfile.write(f"work/audio/df_{n}.wav", sr, (np.clip(y, -1, 1) * 32767).astype(np.int16))
    print(n, "enhanced", round(len(y) / sr, 2), "s", flush=True)

import math

WAVE_FUNCS_DICT = {}

def store():
    def decorator(func):
        WAVE_FUNCS_DICT[func.__name__] = func
        return func
    return decorator

@store()
def sin_w(t, freq=1, ampl=1, phase=0):
    return ampl * math.sin(2 * math.pi * freq * t + phase)

@store()
def sqr_w(t, freq=1, ampl=1):
    return ampl * (1 if math.sin(2 * math.pi * freq * t) >= 0 else -1)

@store()
def tri_w(t, freq=1, ampl=1):
    period = 1.0 / freq
    t_mod = t % period
    if t_mod < period / 2:
        return ampl * (4 * t_mod / period - 1)
    else:
        return ampl * (3 - 4 * t_mod / period)

@store()
def saw_w(t, freq=1, ampl=1):
    period = 1.0 / freq
    t_mod = t % period
    return ampl * (2 * t_mod / period - 1)

@store()
def tri(t, notespan):
    freq = 1.0 / notespan
    ampl = notespan / 4
    return tri_w(t, freq, ampl)

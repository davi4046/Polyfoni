from functools import wraps
import random

FUNCTION_NAMES = [
    "getrandbits", 
    "randrange", 
    "randint", 
    "choice", 
    "choices", 
    "shuffle", 
    "sample", 
    "random", 
    "uniform", 
    "triangular", 
    "betavariate", 
    "expovariate", 
    "gammavariate", 
    "gauss", 
    "lognormvariate", 
    "normalvariate", 
    "vonmisesvariate", 
    "paretovariate", 
    "weibullvariate"
]

def seeded_random_function(original_function):
    @wraps(original_function)
    def seeded_function(seed, *args, **kwargs):
        random.seed(seed)
        return original_function(*args, **kwargs)
    return seeded_function

RAND_FUNCS_DICT = {
    name: seeded_random_function(getattr(random, name)) 
    for name in FUNCTION_NAMES
}

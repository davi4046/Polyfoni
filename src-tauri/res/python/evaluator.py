import sys
import math
import json
from func_timeout import func_set_timeout, FunctionTimedOut

MATH_DICT = {name: getattr(math, name) for name in dir(math)}

GLOBALS = {"__builtins__": None, **MATH_DICT}

@func_set_timeout(0.1)
def evaluate(expr, vars):
    return eval(expr, GLOBALS, vars)

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            expr, vars = line.split("|||", 1)
            vars = json.loads(vars)
            result = evaluate(expr, vars)
            
            sys.stdout.write(str(result) + "\n")
            sys.stdout.flush()
        except (Exception, FunctionTimedOut) as e:
            sys.stdout.write(str(e) + "\n")
            sys.stdout.flush()
        
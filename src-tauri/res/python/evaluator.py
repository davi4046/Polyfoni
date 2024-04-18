import sys
import math
import json
import ast

from func_timeout import func_set_timeout, FunctionTimedOut

MATH_DICT = {name: getattr(math, name) for name in dir(math)}

SAFE_BUILTINS = {
    'abs': abs,
    'all': all,
    'any': any,
    'divmod': divmod,
    'filter': filter,
    'len': len,
    'list': list,
    'map': map,
    'max': max,
    'min': min,
    'next': next,
    'pow': pow,
    'range': range,
    'reversed': reversed,
    'round': round,
    'slice': slice,
    'sorted': sorted,
    'sum': sum
}

GLOBALS = {"__builtins__": SAFE_BUILTINS, **MATH_DICT}

@func_set_timeout(0.1)
def evaluate(args: list[str]):       
    expr, vars = args
    vars = json.loads(vars)
    return eval(expr, {**GLOBALS, **vars})

def find_vars(args: list[str]):
    tree = ast.parse(args[0], mode="eval")
    
    class VariableVisitor(ast.NodeVisitor):
        def __init__(self):
            self.variables = set()
        
        def visit_Name(self, node: ast.Name):
            self.variables.add(node.id)
    
    visitor = VariableVisitor()
    visitor.visit(tree)
    
    return list(visitor.variables)

COMMANDS = {
    "eval": evaluate, 
    "find_vars": find_vars
}

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            line = line.replace(" ", "")
            cmd, *args = line.split("|||")
            
            result = COMMANDS[cmd](args) if cmd in COMMANDS else "No such command"
            
            sys.stdout.write(str(result) + "\n")
            sys.stdout.flush()
        except (Exception, FunctionTimedOut) as e:
            sys.stdout.write(str(e) + "\n")
            sys.stdout.flush()

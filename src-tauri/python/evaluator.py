import sys
import math
import json
import ast
import funcs

from func_timeout import func_set_timeout, FunctionTimedOut

from libs.rand import RAND_FUNCS_DICT

class NameCollector(ast.NodeVisitor):
    def __init__(self):
        self.nodes = []
    
    def visit_Name(self, node: ast.Name):
        self.nodes.append(node)

MATH_DICT = {name: getattr(math, name) for name in dir(math)}

FUNCS_DICT = {name: getattr(funcs, name) for name in dir(funcs)}

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

GLOBALS = {"__builtins__": SAFE_BUILTINS, **MATH_DICT, **FUNCS_DICT, **RAND_FUNCS_DICT}

@func_set_timeout(0.1)
def evaluate(args: list[str]):       
    expr, vars = args
    vars = json.loads(vars)

    str_vars = {key: value for key, value in vars.items() if isinstance(value, str)}
    non_str_vars = {key: value for key, value in vars.items() if key not in str_vars}
    
    tree = ast.parse(expr, mode="eval")
    visitor = NameCollector()
    visitor.visit(tree)
        
    nodes = [node for node in visitor.nodes if node.id in str_vars]

    if len(nodes) > 0:
        fmt_expr = expr[0:nodes[0].col_offset]
        
        for i in range(0, len(nodes)):
            val = str_vars[nodes[i].id]
            start = nodes[i].end_col_offset
            end = nodes[i+1].col_offset if i+1 < len(nodes) else None
            fmt_expr += val + expr[start:end]
    else:
        fmt_expr = expr
            
    return eval(fmt_expr, {**GLOBALS, **non_str_vars})

def get_names(args: list[str]):
    tree = ast.parse(args[0], mode="eval")
    
    visitor = NameCollector()
    visitor.visit(tree)
    
    return [node.id for node in visitor.nodes]

COMMANDS = {
    "eval": evaluate, 
    "get_names": get_names
}

if __name__ == "__main__":
    for line in sys.stdin:
        try:
            cmd, *args = [part.strip() for part in line.split("|||")]
            
            result = json.dumps(COMMANDS[cmd](args)) if cmd in COMMANDS else "No such command"
            
            sys.stdout.write(str(result) + "\n")
            sys.stdout.flush()
        except (Exception, FunctionTimedOut) as e:
            sys.stdout.write(str(e) + "\n")
            sys.stdout.flush()

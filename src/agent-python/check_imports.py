import ast, sys
with open("agent.py", "r", encoding="utf-8") as f:
    source = f.read()
try:
    ast.parse(source)
    print("agent.py: syntax OK")
except SyntaxError as e:
    print(f"SyntaxError: {e}")
    sys.exit(1)

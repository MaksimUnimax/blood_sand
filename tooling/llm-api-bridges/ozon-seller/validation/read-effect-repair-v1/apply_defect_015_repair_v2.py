#!/usr/bin/env python3
from pathlib import Path

v1 = Path(__file__).with_name("apply_defect_015_repair.py")
source = v1.read_text(encoding="utf-8")
old = "return compiled.sub(replacement, text, count=1)"
new = "return compiled.sub(lambda _: replacement, text, count=1)"
if source.count(old) != 1:
    raise RuntimeError(f"expected exactly one applicator substitution site, got {source.count(old)}")
patched = source.replace(old, new, 1)
namespace = {"__name__": "__main__", "__file__": str(v1)}
exec(compile(patched, str(v1), "exec"), namespace, namespace)

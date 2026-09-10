#!/usr/bin/env python3
from __future__ import annotations

import runpy
from pathlib import Path

TARGET = Path(__file__).with_name("materialize_bootstrap_prompt_patch_v3.py")
if not TARGET.is_file():
    raise RuntimeError(f"corrected materializer missing: {TARGET}")
runpy.run_path(str(TARGET), run_name="__main__")

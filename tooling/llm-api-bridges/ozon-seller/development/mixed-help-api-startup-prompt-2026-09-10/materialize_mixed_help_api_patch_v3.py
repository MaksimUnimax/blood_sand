#!/usr/bin/env python3
from __future__ import annotations

import pathlib
import subprocess
import sys

V4 = pathlib.Path(__file__).with_name("materialize_mixed_help_api_patch_v4.py")
subprocess.run([sys.executable, str(V4)], check=True)
print("MIXED_HELP_API_MATERIALIZE_V3_COMPAT_WRAPPER_PASS")

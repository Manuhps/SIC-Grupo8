"""Small import shim for tests.

Pytest collects tests from `events-service/tests`, so we ensure `events-service` root
is on sys.path before importing `app.*`.

This avoids requiring installation as a package.
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

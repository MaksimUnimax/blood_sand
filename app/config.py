from dataclasses import dataclass
from pathlib import Path
import os

@dataclass(frozen=True)
class Config:
    db_path: Path = Path(os.getenv('DB_PATH','/var/lib/marketplace-question-operator/state.sqlite3'))
    jobs_dir: Path = Path(os.getenv('JOBS_DIR','/var/lib/marketplace-question-operator/jobs'))
    reference_dir: Path = Path(os.getenv('REFERENCE_DIR','/opt/blood-sand-recommendations/recommendations'))
    codex_executable: Path = Path(os.getenv('CODEX_EXECUTABLE','/root/.nvm/versions/node/v22.22.1/bin/codex'))
    retention_days: int = 5
    profiles: dict = None
    def __post_init__(self): object.__setattr__(self,'profiles',{'codex1':Path('/root/.codex'),'codex2':Path('/root/.codex_second'),'codex3':Path('/root/.codex_third')})
    def __repr__(self): return 'Config(secrets=<REDACTED>)'

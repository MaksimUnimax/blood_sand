"""Run the proven expiry suite against the combined executable with a unique installable package name."""
from pathlib import Path
import sys

HERE=Path(__file__).resolve().parent
EXPIRY=HERE.parent/'report-file-expiry-v1'/'run_suite.py'
source=EXPIRY.read_text(encoding='utf-8')
old="NAME='OZON_BRIDGE_v0.1.19_REPORT_FILE_EXPIRY_20260912.zip'"
new="NAME='OZON_BRIDGE_v0.1.19_REPORT_XLSX_ALICE_UI_20260912.zip'"
assert source.count(old)==1, 'expiry suite package-name authority changed'
source=source.replace(old,new)
code=compile(source,str(EXPIRY),'exec')
exec(code,{'__name__':'__main__','__file__':str(EXPIRY),'__package__':None})

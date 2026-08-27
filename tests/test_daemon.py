import pytest
from app.config import Config
from app.daemon import live_config
def test_missing_config_redacts_values():
 with pytest.raises(RuntimeError) as e: live_config({'TELEGRAM_BOT_TOKEN':'secret'})
 assert 'secret' not in str(e.value) and 'WB_API_TOKEN' in str(e.value)

def test_live_config_accepts_complete_values_without_repr_leak():
 values={key:'value-'+key for key in ('TELEGRAM_BOT_TOKEN','TELEGRAM_OPERATOR_USER_ID','WB_API_TOKEN','OZON_CLIENT_ID','OZON_API_KEY')}
 assert live_config(values)==values and 'value-' not in repr(Config())

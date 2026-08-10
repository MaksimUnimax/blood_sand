# Yandex Wordstat bridge

Статус: существующий и прошедший acceptance reference provider.

Канонический пакет для импорта: `wordstat-bridge-v1.1.5-full-function-environment-audit.zip`.

Проверенный baseline пакета:

- extension version `1.1.5`;
- full Node test suite: `283/283 PASS`;
- fresh unpacked ZIP Chromium E2E: `21/21 PASS`;
- exactly-once API/delivery lifecycle;
- durable manual operation ownership;
- reload/service-worker recovery без replay оплаченного Yandex request;
- локальное хранение API key.

Этот provider используется как reference implementation для shared lifecycle, но Ozon/WB adapters проектируются по их актуальным официальным API и не должны механически копировать Wordstat request schema.

Secrets в репозиторий не импортируются.

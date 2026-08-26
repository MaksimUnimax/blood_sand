# Patch B3 Warehouse / Stock Geography — candidate manifest

- Base: accepted B2 tree `3566796bc960530e230e054cbdaf08b8dd3ef826eb6eba756f4a7d436492f32c`
- Patch SHA-256: `d5314063b91be87045c42935e259a7731fdc1cacf290cfda1a2035dc238d1b4f`
- Candidate production file count: `21`
- Candidate tree SHA-256: `fec8703195483479efce76a8606b365a6250d65eed9dc3cc9f267c3b89fb7068`

Changed production identities:

- `shared/ozon_operation_registry.js` — `12f14ca76eeccb34c5f5ef24bc276260a1309af4d31baffbb5e17342ec365f54`
- `shared/ozon_contract.js` — `3193207d8e3af865e7a01e2c0757e6483fe87aca7719bade0f65ed8a9cd12a75`
- `shared/ozon_entitlements.js` — `a55b6694e26a96a5267d327a78e4cdd6b27523dbce3eaafb22946072f076e234`

Protected runtime identities remain inherited from accepted B2, including:

- `content_script.js` — `a95b0be6bdd92e6a2caad82c9cbbed79df72e21991eae89affc8bb5bcad824bd`
- `service_worker.js` — `b995ad6eaf6556eac31f728a3640b77b08d6354d5e7e22f5a34f030902059f87`
- `shared/bridge_autorun_model.js` — `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/work_session_model.js` — `11e91d850a3d69711fefdaadb6617b825350d9382b9bc55cabdbbc9b255c9855`
- `shared/ozon_provider.js` — `16e8f85303e7a6a57d0fc76a6ea0e2e9dd8537341fa57397b38b0c0d52dda97b`
- `shared/provider_transport_core.js` — `7c346ad77dce1bbac73a2170f2f07fe6845f52a10a5b30f448afef2b80c5abb8`
- `shared/manual_controls.js` — `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`

The candidate adds no Autorun/Work-session change and no real-provider test requirement.

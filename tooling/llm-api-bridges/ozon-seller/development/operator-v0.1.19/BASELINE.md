# Operator Ozon Bridge v0.1.19 development baseline

Date: 2026-08-17
Status: exact operator-supplied development baseline; **not canonical release acceptance**.

Source artifact:

`ozon-bridge-v0.1.19-extension.zip`

SHA-256:

`2b86518bfdc81081e271c7f8346188fc7047999385d1da4428fa2a133dba15bf`

Production files: 17.

This artifact is the exact operator baseline for Step 1 (Contract + Capability layer). It is intentionally isolated on the development branch `dev/ozon-v0.1.19-step1-contract-capability-2026-08-17`. Importing it does not advance or rewrite the canonical v0.1.11 release lineage.

Exact production-file SHA-256:

- `content_script.js` — `b80fcf1784e083292cc48c0780480651b144a96494083c7df2af3dce97504132`
- `manifest.json` — `6ed5ecc768cc980d256b5bfb69f00c9a4006ec2eb2bd6c96f9d261d7a018e0fb`
- `popup.css` — `dd7249e12813f54af66b35a07dab93189d6643416019f0873f9d5624297e34b5`
- `popup.html` — `5fdf3932ef0f523626da65fff4c5919df19c321bc23fee861e95d5d940a185d5`
- `popup.js` — `8e1d95340d3e87b8a8cadda50276033e336f633469a5dbceaacd74b2d10239fd`
- `service_worker.js` — `8b8190803b28daf9da8b852bddbcfb1d6c079bb93eee9eda35fed516764458ec`
- `shared/ai_adapters.js` — `5a7307557998d4281d12fb750fb0d05fa787d2a4550281d006ebbc6a2006e4e9`
- `shared/bridge_autorun_model.js` — `c248915a64ea0d9e2db014d66ab27a4bc182553cc24c5d6d0c9f43729e6e20b5`
- `shared/composer_send.js` — `3e9421e8e1bc209af635e2b90d957e558301763572a42875b95c8973ca75b736`
- `shared/conversation_identity.js` — `939036acd95ccb3dfe00f05b5d49568615f6d798a023a0ec995e38267fb68f57`
- `shared/manual_controls.js` — `81f302487da7b5ff7c1b746298353438b2cfec100a5bb8f7fa2c80d1e033c81e`
- `shared/ozon_contract.js` — `b3497d3cec56a7591dce0f266ee5e9683613e5375be1b0c72b063bff8305fb1e`
- `shared/ozon_credentials.js` — `286c6021f958e41912842569bcfa0d0dfe920eed8ce1646014899a1de064415d`
- `shared/ozon_provider.js` — `318ca0e872942b08a92ce787bc5b3ed8637434318a534f528e387206731c2455`
- `shared/proven_writing_block_capture.js` — `5b0eaac9619cb827d1e74c61f53e2755c084a1d4b60c64d23f5fd4a5354c3aef`
- `shared/provider_transport_core.js` — `9c33c7c2448959f75eb5d0c2b36137bba68085c4b93a90a8c67d1ee86de4aa39`
- `shared/runtime_names.js` — `2abc73a8c6f5ba29e71c352c452fcc4da1cbf278de988fdc070dc5414d908292`

Step 1 must protect AI DOM/binding/delivery behavior and Performance API behavior unless a direct dependency is demonstrated.
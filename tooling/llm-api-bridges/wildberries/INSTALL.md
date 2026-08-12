# Install Wildberries Bridge v0.1.2

Artifact: `wildberries-bridge-v0.1.2-extension.zip`  
SHA-256: `56f0c78911db8ea84c82c3e874c8ac59c46acbf633886b014225d5ab0afe8715`  
Bytes: `84964`

1. Verify the ZIP SHA-256.
2. Extract the ZIP. The resulting folder is `wildberries-bridge-v0.1.2-extension/`.
3. Open `chrome://extensions` in Chrome/Chromium.
4. Enable **Developer mode**.
5. Choose **Load unpacked** and select the extracted `wildberries-bridge-v0.1.2-extension/` folder.
6. Open the target ChatGPT conversation and open the Wildberries Bridge popup.
7. Enter the WB **Personal token** locally. v0.1.2 does not use `X-Client-Secret` or Service/Basic token flow.
8. Bind the current ChatGPT conversation.
9. Use **Проверить API** once for the explicit WB connectivity check; do not poll it.
10. Run a real executable read smoke such as `seller_info` or `cards_list`, then verify the returned `WB_RESULT_V1` contains no credentials/customer PII.

Three official reads that require Service token are intentionally blocked in this Personal-token build. Direct PII surfaces are also blocked.

The release is **AUTOMATED TESTED / CURRENT OPENAPI CLASSIFIED**, not yet **LIVE USER-ACCOUNT ACCEPTED**.

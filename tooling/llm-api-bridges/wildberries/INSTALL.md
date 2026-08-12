# Install Wildberries Bridge v0.1.1

Artifact: `wildberries-bridge-v0.1.1-extension.zip`  
SHA-256: `3ffd3c2158c67723c62aa2b6d7a73c152e964e7ab030fecf8a6d67666030f3a2`  
Bytes: `82701`

1. Verify the ZIP SHA-256.
2. Extract the ZIP. The resulting folder is `wildberries-bridge-v0.1.1-extension/`.
3. Open `chrome://extensions` in Chrome/Chromium.
4. Enable **Developer mode**.
5. Choose **Load unpacked** and select the extracted `wildberries-bridge-v0.1.1-extension/` folder.
6. Open the target ChatGPT conversation and open the Wildberries Bridge popup.
7. Enter the WB token locally. Choose the actual token type. For Service/Basic token flows provide `X-Client-Secret`; Personal token must not use it.
8. Bind the current ChatGPT conversation.
9. Use **Проверить API** once to call official `/ping`. WB documents a limit of 3 `/ping` requests per 30 seconds per host, so do not poll it.
10. Run a real read smoke such as `seller_info` or `cards_list`, then verify the returned `WB_RESULT_V1` contains no credentials/customer PII.

The release is **AUTOMATED TESTED**, not yet **LIVE USER-ACCOUNT ACCEPTED**.

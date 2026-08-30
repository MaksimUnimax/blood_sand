# VK recommendation illustration registry

`KIP_VK_PRODUCT_ILLUSTRATIONS_V1` is a presentation-only contract. The checked-in
registry lists the active product keys derived from the recommendation matrix; it
contains no VK IDs, source paths, or credentials.

When `KIP_VK_RECOMMENDATION_IMAGES_ENABLED=true`, the runtime loads and validates
`KIP_VK_PRODUCT_ILLUSTRATIONS_PATH` once during startup. The protected JSON has
`{"version":1,"attachments":{"product_key":"photo<owner>_<id>"}}` and must
cover exactly the active matrix keys. A malformed or incomplete registry blocks
startup; with images disabled, text-only recommendations keep working.

The resolved photo is serialized into `vk_outbox.attachment_json` alongside the
message, keyboard, and `random_id`. Retries therefore do not reread the registry
or upload an image. The safe outbox audit records only presence, type, and count.

## Operator workflow

Bootstrap the current approved placeholder once and assign it to all active
products:

```bash
register_vk_product_image.py --product-key veles \
  --file /opt/blood-sand-vk-assets/pechat_velesa.png \
  --assign-all-active-products
```

For a later independent replacement, for example Rodimich:

```bash
register_vk_product_image.py --product-key rodimich \
  --file /opt/blood-sand-vk-assets/rodimich.png
```

The tool uses the protected staging community environment, uploads/saves only
the supplied source image, atomically changes only the requested mapping, and
does not print tokens, upload URLs, or the resulting attachment ID. Restart the
runtime after a replacement so it loads the new immutable mapping.

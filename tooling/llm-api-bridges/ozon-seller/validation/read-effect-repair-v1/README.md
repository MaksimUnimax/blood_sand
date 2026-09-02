# Ozon Seller read-effect repair v1

This repair reclassifies passive report/document/label/act/validation generation as READ when it does not change Seller/Ozon business or process state.

Expected repaired runtime surface:
- Seller current reads: 271
- Performance canonical current reads: 21
- Combined canonical runtime reads: 292
- Registry aliases including Performance compatibility aliases: 296

The deterministic overlay fails closed on source anchors and adds exactly 26 corrected Seller READ operations. The runtime gate validates aliases, contract normalization, entitlement presence, binary metadata and Personal Data gate assignments on Linux and Windows.

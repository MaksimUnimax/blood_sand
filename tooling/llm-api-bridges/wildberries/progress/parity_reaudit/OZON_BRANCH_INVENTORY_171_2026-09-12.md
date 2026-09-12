# Ozon Bridge history inventory — 171 branches

Date: 2026-09-12
Purpose: exhaustive branch inventory for the WB parity re-audit. This supersedes the earlier practice of treating Ozon v0.1.19 as a small set of representative patches. It does not by itself declare every branch accepted; branches are evidence inputs whose final semantics must be reconciled against the mature Ozon source and accepted later repair/test chains.

GitHub branch search for `ozon` returned exactly 171 branches in two pages (100 + 71). The exact names are preserved below so no family is silently skipped.

## Page 1 — 100 branches

1. audit/ozon-b1-b49-v2-reconciliation-2026-08-28
2. audit/ozon-date-contract-sweep-2026-09-04-copy
3. audit/ozon-date-contract-sweep-2026-09-04-temp
4. audit/ozon-date-contract-sweep-2026-09-04-temp2
5. audit/ozon-date-contract-sweep-2026-09-04
6. design/ozon-guided-command-discovery-2026-08-21
7. design/ozon-multi-ai-autodetect-multichannel-2026-09-02
8. design/ozon-session-lifecycle-and-personal-data-policy-2026-08-21
9. dev/ozon-v0.1.19-final-live-acceptance-2026-08-18
10. dev/ozon-v0.1.19-live-repair-quota-countdown-2026-08-18
11. dev/ozon-v0.1.19-manual-delivery-composer-wait-2026-08-18
12. dev/ozon-v0.1.19-step1-contract-capability-2026-08-17
13. dev/ozon-v0.1.19-step2-query-planner-coalescing-2026-08-17
14. dev/ozon-v0.1.19-step3-quota-verifier-errors-2026-08-17
15. dev/ozon-v0.1.19-step4-cache-prefetch-semantic-acceptance-2026-08-18
16. diag/ozon-xlsx-live-zero-rows-2026-09-07
17. docs/ozon-api-complete-coverage-2026-08-25
18. docs/ozon-command-envelope-authority-2026-09-07
19. docs/ozon-complete-read-surface-plan-2026-08-25
20. docs/ozon-llm-regression-2026-09-12
21. engineering/ozon-live-repair-final-prefreeze-completion-2026-08-18
22. engineering/ozon-live-repair-final-prefreeze-completion-rerun-2026-08-18
23. engineering/ozon-live-repair-prefreeze-behavioral-v3-2026-08-18
24. engineering/ozon-live-repair-prefreeze-behavioral-v3b-2026-08-18
25. engineering/ozon-live-repair-prefreeze-diagnostic-v3f-2026-08-18
26. engineering/ozon-live-repair-prefreeze-executable-v3c-2026-08-18
27. engineering/ozon-live-repair-prefreeze-executable-v3d-2026-08-18
28. engineering/ozon-live-repair-prefreeze-executable-v3e-2026-08-18
29. engineering/ozon-live-repair-prefreeze-reconstruction-2026-08-18
30. engineering/ozon-live-repair-prefreeze-reconstruction-v2-2026-08-18
31. engineering/ozon-live-repair-prefreeze-reconstruction-v3-2026-08-18
32. feature/ozon-b1-assortment-master-contracts-2026-08-25
33. feature/ozon-b2-prices-listing-state-contracts-2026-08-26
34. feature/ozon-b3-warehouse-stock-geography-contracts-2026-08-26
35. feature/ozon-b4-orders-returns-cancellations-contracts-2026-08-26
36. feature/ozon-b5-finance-realization-contracts-2026-08-26
37. feature/ozon-b6-performance-read-core-2026-08-26
38. feature/ozon-b7-analytics-search-contracts-2026-08-26
39. feature/ozon-b8-supply-replenishment-2026-08-26
40. feature/ozon-b9-reviews-questions-2026-08-26
41. feature/ozon-b10-seller-health-ratings-2026-08-26
42. feature/ozon-b11-catalog-diagnostics-content-2026-08-26
43. feature/ozon-b12-finance-transactions-sunset-2026-08-27
44. feature/ozon-b13-promotions-market-reads-2026-08-27
45. feature/ozon-b14-pricing-strategy-reads-2026-08-27
46. feature/ozon-b15-catalog-reference-reads-2026-08-27
47. feature/ozon-b16-warehouse-delivery-diagnostics-2026-08-27
48. feature/ozon-b17-reviews-questions-extended-reads-2026-08-27
49. feature/ozon-b18-pricing-strategy-extended-reads-2026-08-27
50. feature/ozon-b19-catalog-certification-reference-reads-2026-08-27
51. feature/ozon-b20-catalog-certificate-data-reads-2026-08-27
52. feature/ozon-b21-return-giveout-reads-2026-08-27
53. feature/ozon-b22-cancellation-reason-reads-2026-08-27
54. feature/ozon-b23-seller-account-logistics-reads-2026-08-27
55. feature/ozon-b24-fbo-supply-status-act-reads-2026-08-28
56. feature/ozon-b25-cancellation-read-completion-2026-08-28
57. feature/ozon-b25-safe-reference-settings-no-body-reads-2026-08-28
58. feature/ozon-b26-fbo-draft-cargo-reads-2026-08-28
59. feature/ozon-b26-fbo-posting-detail-read-2026-08-28
60. feature/ozon-b27-fbo-draft-location-planning-reads-2026-08-28
61. feature/ozon-b28-fbo-transport-cargo-reads-2026-08-28
62. feature/ozon-b29-product-stock-reads-2026-08-28
63. feature/ozon-b30-fbs-delivery-assembly-reads-2026-08-28
64. feature/ozon-b31-fbs-carriage-container-reads-2026-08-28
65. feature/ozon-b32-fbs-operational-reference-reads-2026-08-28
66. feature/ozon-b33-operational-status-reference-reads-2026-08-28
67. feature/ozon-b34-stock-analytics-extended-reads-2026-08-28
68. feature/ozon-b35-marketplace-search-query-reads-2026-08-28
69. feature/ozon-b36-fbp-planning-reads-2026-08-28
70. feature/ozon-b37-fbo-removal-report-reads-2026-08-28
71. feature/ozon-b38-finance-ledger-reads-2026-08-28
72. feature/ozon-b39-fbs-pickup-geography-reads-2026-08-28
73. feature/ozon-b40-finance-balance-realization-reads-2026-08-28
74. feature/ozon-b41-finance-buyout-read-2026-08-28
75. feature/ozon-b42-fbs-warehouse-setup-reference-reads-2026-08-28
76. feature/ozon-b43-fbp-posting-reads-2026-08-28
77. feature/ozon-b44-fbo-posting-get-2026-08-28
78. feature/ozon-b45-seller-action-candidates-2026-08-28
79. feature/ozon-b46-fbs-posting-cancel-reason-2026-08-28
80. feature/ozon-b47-unpaid-legal-products-2026-08-28
81. feature/ozon-b48-fbo-draft-timeslot-info-2026-08-28
82. feature/ozon-b49-fbs-posting-timeslot-change-restrictions-2026-08-28
83. feature/ozon-full-read-core-b0-2026-08-25
84. feature/ozon-guided-command-discovery-2026-08-21
85. feature/ozon-work-session-lifecycle-2026-08-21
86. fix/ozon-work-composer-control-2026-08-21
87. fix/ozon-work-resume-provider-status-separation-2026-08-24
88. fix/ozon-work-session-finish-no-autorun-2026-08-24
89. fix/ozon-work-session-refresh-inprocess-reinit-2026-08-24
90. fix/ozon-work-session-refresh-response-boundary-2026-08-24
91. fix/ozon-work-session-refresh-wake-2026-08-24
92. handoff/ozon-file-delivery-append-log-2026-09-08
93. handoff/ozon-multi-ai-file-delivery-files-2026-09-08
94. implementation/mqo-ozon-manual-ingress-2026-08-28
95. repair/ozon-alice-auto-send-2026-09-11
96. repair/ozon-alice-drag-drop-transport-2026-09-11
97. repair/ozon-alice-large-result-document-delivery-2026-09-10
98. repair/ozon-alice-provider-file-runtime-capability-2026-09-11
99. repair/ozon-alice-provider-file-runtime-capability-prefx-2026-09-11
100. repair/ozon-alice-spa-attachment-owner-2026-09-11

## Page 2 — 71 branches

101. repair/ozon-alice-xlsx-live-capability-2026-09-12
102. repair/ozon-autorun-help-v2-marker-2026-09-12
103. repair/ozon-bootstrap-prompt-editable-new-chat-2026-09-10
104. repair/ozon-current-swagger-refresh-2026-09-01
105. repair/ozon-date-contract-2026-09-04
106. repair/ozon-disabled-alias-admission-2026-09-07
107. repair/ozon-generic-direct-binary-delivery-2026-09-08
108. repair/ozon-global-toast-work-restart-2026-09-11
109. repair/ozon-global-toast-work-restart-prefx-2026-09-11
110. repair/ozon-help-v2-autorun-marker-2026-09-12
111. repair/ozon-indexeddb-transaction-durability-2026-09-11
112. repair/ozon-llm-output-report-workflow-2026-09-11
113. repair/ozon-mixed-help-api-startup-prompt-2026-09-10
114. repair/ozon-multi-ai-file-delivery-2026-09-08
115. repair/ozon-provider-lifecycle-terminalization-2026-09-07
116. repair/ozon-read-effect-reclassification-2026-09-02
117. repair/ozon-step7-245-read-candidate-2026-08-31
118. repair/ozon-step7-245-read-clean-2026-08-31
119. repair/ozon-step7-245-read-final-candidate-2026-08-31
120. repair/ozon-step7-245-read-final-candidate-v2-2026-08-31
121. repair/ozon-step7-245-read-final-candidate-v3-2026-08-31
122. repair/ozon-step7-245-read-formal-acceptance-2026-08-31
123. repair/ozon-step7-245-read-formal-acceptance-v1-2026-08-31
124. repair/ozon-step7-authority-materializer-2026-08-30
125. repair/ozon-step7-exact-swagger-authority-v2-2026-08-30
126. repair/ozon-step7-exact-swagger-authority-v2-clean-2026-08-31
127. repair/ozon-step7-exact-swagger-authority-v2-upload-staging-2026-08-31
128. repair/ozon-step8-performance-48-formal-v2-2026-09-01
129. repair/ozon-step8-performance-48-terminal-2026-08-31
130. repair/ozon-step9-full-integration-266-reads-2026-09-01
131. repair/ozon-step10-owner-live-acceptance-evidence-2026-09-01
132. repair/ozon-step10-owner-live-acceptance-evidence-final-2026-09-01
133. repair/ozon-step10-owner-live-acceptance-evidence-frozen-2026-09-01
134. repair/ozon-step10-owner-live-acceptance-evidence-frozen-v2-2026-09-01
135. repair/ozon-step10-owner-live-acceptance-evidence-frozen-v3-2026-09-01
136. repair/ozon-step10-owner-live-evidence-2026-09-01
137. repair/ozon-step10-owner-live-evidence-final-2026-09-01
138. repair/ozon-step10-owner-live-evidence-v1-2026-09-01
139. repair/ozon-step10-postrelease-live-acceptance-record-2026-09-01
140. repair/ozon-step10-postrelease-live-finalize-2026-09-01
141. repair/ozon-step10-postrelease-live-finalize-v2-2026-09-01
142. repair/ozon-step10-postrelease-owner-live-acceptance-2026-09-01
143. repair/ozon-step10-postrelease-owner-live-acceptance-final-2026-09-01
144. repair/ozon-step10-postrelease-owner-live-acceptance-final-v2-2026-09-01
145. repair/ozon-step10-postrelease-owner-live-acceptance-v1-2026-09-01
146. repair/ozon-step10-postrelease-owner-live-acceptance-v2-2026-09-01
147. repair/ozon-step10-postrelease-owner-live-acceptance-v3-2026-09-01
148. repair/ozon-v2-b1-stocks-warehouse-2026-08-29
149. repair/ozon-work-session-lifecycle-2026-08-24
150. repair/ozon-xlsx-implicit-cell-ref-2026-09-07
151. repair/ozon-xlsx-worksheet-namespace-parser-2026-09-07
152. research/ozon-official-swagger-browser-fetch
153. research/ozon-official-swagger-browser-fetch2
154. research/ozon-official-swagger-fetch
155. research/ozon-product-demand-2026-09-02
156. rollback/ozon-provider-lifecycle-terminalization-2026-09-07
157. staging/ozon-multiai-v0.1.13-2026-08-17
158. test/ozon-v0.1.19-full-read-266-live-2026-09-01
159. test/ozon-work-session-lifecycle-patch-a-browser-candidate-2026-08-24
160. tmp/ozon-b0-rematerialize-2026-08-29
161. tmp/ozon-live-gate-corrective-onepatch-2026-09-03
162. validation/ozon-final-live-acceptance-2026-08-18
163. validation/ozon-live-repair-independent-acceptance-2026-08-18
164. validation/ozon-manual-delivery-composer-wait-2026-08-20
165. validation/ozon-step1-contract-capability-2026-08-17
166. validation/ozon-step1-contract-capability-retest-2026-08-17
167. validation/ozon-step1-contract-capability-retest-v2-2026-08-17
168. validation/ozon-step2-query-planner-coalescing-2026-08-17
169. validation/ozon-step3-quota-verifier-errors-2026-08-17
170. validation/ozon-step4-cache-prefetch-semantic-2026-08-18
171. work/ozon-data-collection-2026-08-11

## Audit rule

- `dev/feature/fix/repair` branches are implementation/repair inputs.
- `validation/test/audit/engineering` branches are independent evidence and acceptance/reconstruction inputs.
- `design/docs/research/work` branches establish intent, contracts, source authority, or discovery boundaries.
- `rollback/tmp/staging/handoff/*-prefx/copy/temp` branches are not silently treated as final truth; they are read because they often explain why a later accepted repair exists.
- Provider-specific Ozon read-surface branches B0–B49 / 245 / 48 Performance / 266 are grouped for WB parity by methodology, not copied endpoint-for-endpoint.
- Final behavior authority is reconciled from the mature Ozon 0.1.19 source plus later accepted repair chains, not from branch naming alone.

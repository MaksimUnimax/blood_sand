# Checkpoint 03B — full targeted PASS, real Chrome next-turn failure

Run34697449141: full targeted chain including prior31 PASS. Real Chrome passed queue+Port one-file/deferral, actual full-TXT IDB write, preservation after confirmation, actual stopWorker/new target/new global. Failed the next explicit local-TXT Port commit: ATTACHMENT_DELIVERY_NOT_FOUND. Production materialization job correctly SKIPPED. No ready package claimed.

Do not assume this is a fixture problem: determine whether local read was blocked or owner changed during browser bootstrap. Existing browser test only checked HTTP0/externalfalse (which also describes a blocked local result), so add semantic local_file_ready assertion and returned/stored owner diagnostics before Port. The stronger assertion is retained for final tests. No production change has been made since frozen stage.

NEXT: isolated real-browser diagnostic, classify exact failed boundary, correct source or fixture only as demonstrated, repeat complete targeted+Chrome before materialization. Then final same-ZIP platform chain. Provider calls=0.

import type { BootstrapDetectedAiV1 } from "@product/contracts";

export type SimulatedPackagedTabFixture = "CHATGPT_STANDARD" | "CHATGPT_WORK";

export type SimulatedPackagedTab = {
  url: string;
  fixture: SimulatedPackagedTabFixture;
};

const CHATGPT_ORIGIN = "https://chatgpt.com";

/**
 * This is packaged fixture knowledge, not a claim about the live ChatGPT DOM.
 * Host trust is decided from URL parsing and exact origin equality.
 */
export function detectSimulatedPackagedAi(
  tab: SimulatedPackagedTab,
): BootstrapDetectedAiV1 | null {
  let url: URL;
  try {
    url = new URL(tab.url);
  } catch {
    return null;
  }
  if (
    url.origin !== CHATGPT_ORIGIN ||
    url.username !== "" ||
    url.password !== ""
  )
    return null;
  switch (tab.fixture) {
    case "CHATGPT_STANDARD":
      return {
        family: "chatgpt",
        surface: "standard",
        variant: "standard_composer_v1",
      };
    case "CHATGPT_WORK":
      return {
        family: "chatgpt",
        surface: "work",
        variant: "work_composer_v3",
      };
  }
}

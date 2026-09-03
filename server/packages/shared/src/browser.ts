export const BrowserFamilies = ["chrome", "yandex_chromium"] as const;

export type BrowserFamily = (typeof BrowserFamilies)[number];

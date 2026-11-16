export function normalizeText(value: string): string;
export function translateText(value: string, dictionary: Record<string, string>): string;
export function localizedHref(value: string, chinese: boolean): string;
export function loadTranslations(): Promise<Record<string, string>>;

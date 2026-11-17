export function loadPublicJson<T>(
  path: string,
  versionAttribute: string,
  validate: (data: unknown) => boolean,
): Promise<T>;

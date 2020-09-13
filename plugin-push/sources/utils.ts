import path from "path";

/**
 * Adds a cloud storage bucket schema prefix and a leading slash if missing.
 *
 * @example
 *   "pkg.example.com" => "gs://pkg.example.com/"
 *   "gs://pkg.example.com" => "gs://pkg.example.com/"
 *
 * @returns {string} Sanitized bucket name.
 */
export function sanitizeBucket(bucket: string): string {
  const result = bucket.includes("://")
    ? bucket.endsWith("/")
      ? bucket
      : `${bucket}/`
    : bucket.endsWith("/")
    ? `gs://${bucket}`
    : `gs://${bucket}/`;

  if (!result.startsWith("gs://")) {
    throw new Error(
      "Only Google Cloud Storage buckets are supported at the moment.",
    );
  }

  return result;
}

/**
 * Extract the actual source and target file names from the source string.
 *
 * @example
 *   [source: "dist/app.zip", version: "123"] => "app_123.zip"
 *   [source: "dist/app.zip:app.zip", version: "123"] => "app.zip"
 *   [source: "dist/app.zip:{version}_app.zip", version: "123"] => "123_app.zip"
 * @param source Source pattern
 * @param version Target version
 */
export function parseSource(
  source: string,
  version: string,
): [source: string, target: string] {
  const i = source.indexOf(":");
  const filename = i === -1 ? source : source.substring(0, i);
  const extname = path.extname(filename);

  const basename =
    extname === ""
      ? path.basename(filename)
      : path.basename(filename).slice(0, -extname.length);

  const target =
    i === -1 ? `${basename}_{version}${extname}` : source.substring(i + 1);

  return [filename, target.replace(/\{version\}/gi, version)];
}

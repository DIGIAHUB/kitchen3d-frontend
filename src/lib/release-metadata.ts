/**
 * A deliberate release gate, not a client-exposed feature flag. Local review
 * modes always remain non-indexable even if an inherited environment is wrong.
 */
export function releaseIndexingEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.K3D_RELEASE_INDEXING === "1"
    && env.K3D_LOCAL_PREVIEW !== "1"
    && env.K3D_LOCAL_CANDIDATE !== "1";
}

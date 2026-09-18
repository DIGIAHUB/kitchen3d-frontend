/**
 * Public indexing is enabled only on the Vercel production deployment. Local
 * review and candidate modes remain non-indexable even if another environment
 * variable is inherited unexpectedly.
 */
export function releaseIndexingEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV === "production"
    && env.K3D_LOCAL_PREVIEW !== "1"
    && env.K3D_LOCAL_CANDIDATE !== "1";
}

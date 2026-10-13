export type VaultDisplayState = "loading" | "error" | "empty" | "populated";

export function getVaultDisplayState(input: { loading: boolean; error: string; items: readonly unknown[] }): VaultDisplayState {
  if (input.loading) return "loading";
  if (input.error) return "error";
  return input.items.length ? "populated" : "empty";
}
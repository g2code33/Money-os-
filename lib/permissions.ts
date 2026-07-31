import type { PermissionLevel } from "./types";

export const permissionLabels: Record<PermissionLevel, string> = {
  0: "Think only",
  1: "Research",
  2: "Build/draft",
  3: "Create PR / prepare publish",
  4: "Deploy / publish",
  5: "Contact customers",
  6: "Financial action"
};

export function requiresApproval(actionLevel: PermissionLevel, autoApprovalLevel: PermissionLevel): boolean {
  return actionLevel > autoApprovalLevel || actionLevel >= 4;
}

export function getDefaultAutoApprovalLevel(): PermissionLevel {
  const raw = Number(process.env.MONEYOS_DEFAULT_AUTO_APPROVAL_LEVEL ?? 1);
  if ([0, 1, 2, 3, 4, 5, 6].includes(raw)) return raw as PermissionLevel;
  return 1;
}

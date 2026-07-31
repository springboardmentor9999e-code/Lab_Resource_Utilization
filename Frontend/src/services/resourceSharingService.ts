/**
 * MILESTONE 2 — NOT IMPLEMENTED IN BACKEND.
 * TODO(backend): add ResourceSharingController.
 *   Suggested endpoints:
 *     GET  /api/resource-sharing/shared
 *     GET  /api/resource-sharing/institutions          -> list of partner institutions
 *     POST /api/resource-sharing/request               { equipmentId, requesterInstitutionId, purpose }
 *     PUT  /api/resource-sharing/{id}/approve
 *     PUT  /api/resource-sharing/{id}/reject
 *     GET  /api/resource-sharing/history
 */

export interface SharedEquipment {
  id: number;
  equipmentId: number;
  equipmentName: string;
  ownerInstitutionId: number;
  ownerInstitutionName: string;
  availability: "AVAILABLE" | "BORROWED" | "PENDING";
  since?: string;
}

export interface ShareRequest {
  id: number;
  equipmentId: number;
  requesterInstitutionId: number;
  ownerInstitutionId: number;
  purpose: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED";
  createdAt: string;
}

export const listSharedEquipment = async (): Promise<SharedEquipment[]> => [];
export const listShareRequests = async (): Promise<ShareRequest[]> => [];
export const createShareRequest = async (
  _payload: { equipmentId: number; requesterInstitutionId: number; purpose: string },
): Promise<ShareRequest | null> => null;
export const approveShareRequest = async (_id: number): Promise<ShareRequest | null> => null;
export const rejectShareRequest = async (_id: number): Promise<ShareRequest | null> => null;

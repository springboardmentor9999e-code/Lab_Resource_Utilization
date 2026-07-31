/**
 * MILESTONE 2 — NOT IMPLEMENTED IN BACKEND.
 * TODO(backend): add BookingOptimizationController.
 *   Suggested endpoints:
 *     POST /api/optimization/check-conflicts     { equipmentId, startTime, endTime }
 *     POST /api/optimization/suggest-slots       { equipmentId, durationMinutes }
 *     POST /api/optimization/suggest-equipment   { categoryId, startTime, endTime }
 *     GET  /api/optimization/priority-queue
 */

export interface SlotSuggestion {
  equipmentId: number;
  equipmentName?: string;
  startTime: string;
  endTime: string;
  score: number;
}

export interface ConflictCheckResult {
  hasConflict: boolean;
  conflictingBookingIds: number[];
  suggestions: SlotSuggestion[];
}

export const checkConflicts = async (
  _payload: { equipmentId: number; startTime: string; endTime: string },
): Promise<ConflictCheckResult> => ({ hasConflict: false, conflictingBookingIds: [], suggestions: [] });

export const suggestSlots = async (
  _payload: { equipmentId: number; durationMinutes: number },
): Promise<SlotSuggestion[]> => [];

export const suggestAlternativeEquipment = async (
  _payload: { categoryId: number; startTime: string; endTime: string },
): Promise<SlotSuggestion[]> => [];

import { apiClient } from "./client";

// Backend BillingRecord fields: billingRecordId, booking, equipment,
// billedInstitution, ownerInstitution, hourlyRate, hoursUsed, totalCost,
// status ("Pending" | "Invoiced" | "Paid"), createdAt. Generated automatically
// when a cross-institution booking (booker's institution != equipment's
// institution) with a priced equipment rate is marked Completed - there's no
// manual "create" endpoint, only read + status update.
export const billingRecordsApi = {
  list: () => apiClient.get("/api/billing-records").then((r) => r.data),
  updateStatus: (id, status) =>
    apiClient.put(`/api/billing-records/${id}/status`, { status }).then((r) => r.data),
};

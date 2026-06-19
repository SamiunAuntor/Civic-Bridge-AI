import { apiClient } from "@/lib/api-client";
import type { ApiSuccessResponse } from "@/types/api";
import type { Simulation } from "@/types/domain";

export interface CreateSimulationBody {
  assessmentId: string;
  decision: string;
}

export interface CreateSimulationResult {
  simulation: Simulation;
  savedSimulation: Simulation;
}

export function createSimulation(body: CreateSimulationBody) {
  return apiClient.post<
    ApiSuccessResponse<CreateSimulationResult>,
    CreateSimulationBody
  >("/simulations", body);
}

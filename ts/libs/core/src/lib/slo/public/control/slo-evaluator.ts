import { ServiceLevelObjective } from '../common';

/**
 * An `SloEvaluator` is used to actually execute an SLO during an iteration.
 *
 * It should be used to implement orchestrator-specific preprocessing, handling of the output, etc.
 */
export interface SloEvaluator {

    /**
     * Executes the specified SLO and applies its output to the orchestrator.
     *
     * @param key The key used to identify the SLO.
     * @param slo The `ServiceLevelObjective` that should be evaluated.
     * @returns A Promise that resolves when the evaluation of the SLO has finished
     * and its output has been applied to the orchestrator if necessary.
     */
    evaluateSlo(key: string, slo: ServiceLevelObjective<any, any>): Promise<void>;

}

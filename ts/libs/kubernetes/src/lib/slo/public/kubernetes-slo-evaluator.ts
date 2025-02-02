import { KubernetesObject, KubernetesObjectApi } from '@kubernetes/client-node';
import { ApiObject, Logger, POLARIS_API, PolarisRuntime, SloEvaluatorBase, SloOutput } from '@polaris-sloc/core';
import { KubernetesObjectHeader, KubernetesObjectWithSpec } from '../../model';

export class KubernetesSloEvaluator extends SloEvaluatorBase {

    constructor(
        private polarisRuntime: PolarisRuntime,
        private k8sClient: KubernetesObjectApi,
    ) {
        super();
    }

    onAfterEvaluateSlo(key: string, currContext: never, sloOutput: SloOutput<any>): Promise<void> {
        const elasticityStrategyName = `${key}-elasticity-strategy`
        const elasticityStrategy = this.polarisRuntime.elasticityStrategyService.fromSloOutput(elasticityStrategyName, sloOutput);
        const k8sElasticityStrat = this.transformToKubernetesObject(elasticityStrategy);

        Logger.log(`SLO ${k8sElasticityStrat.metadata.name}: Applying elasticityStrategy`, k8sElasticityStrat);
        return this.k8sClient.create(
            k8sElasticityStrat,
        ).catch(err => {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            if (err?.body?.reason === 'AlreadyExists') {
                Logger.log('Resource already exists, trying to replace it');
                return this.updateExistingElasticityStrategy(k8sElasticityStrat);
            }
            throw err;
        }).then(
            () => Logger.log('Resource successfully created/replaced'),
        );
    }

    private transformToKubernetesObject(obj: ApiObject<any>): KubernetesObjectWithSpec<any> {
        return this.polarisRuntime.transformer.transformToOrchestratorPlainObject(obj) as KubernetesObjectWithSpec<any>;
    }

    private async updateExistingElasticityStrategy(newSpec: KubernetesObjectWithSpec<any>): Promise<void> {
        const readReq: KubernetesObjectHeader<KubernetesObject> = {
            apiVersion: newSpec.apiVersion,
            kind: newSpec.kind,
            metadata: {
                namespace: newSpec.metadata.namespace,
                name: newSpec.metadata.name,
            },
        };
        const readResponse = await this.k8sClient.read(readReq);
        const currStrategyData = readResponse.body;

        const newStrategyData = { ...newSpec };
        delete newStrategyData.metadata;
        const update = {
            ...currStrategyData,
            ...newStrategyData,
        };

        update.metadata.labels = update.metadata.labels ?? {};
        update.metadata.labels[POLARIS_API.LAST_MODIFIED_LABEL] = Date.now().toString();

        await this.k8sClient.replace(update);
    }

}

import { KubeConfig } from '@kubernetes/client-node';
import { CostEfficiencySloMapping, CostEfficiencySloMappingSpec, initPolarisLib as initCommonMappingsLib } from '@polaris-sloc/common-mappings';
import { initCostEfficiencyMetrics } from '@polaris-sloc/cost-efficiency';
import { initPolarisKubernetes } from '@polaris-sloc/kubernetes';
import { initPrometheusQueryBackend } from '@polaris-sloc/prometheus';
import { interval } from 'rxjs';
import { CostEfficiencySlo } from './app/cost-efficiency-slo';
import { convertToNumber, getEnvironmentVariable } from './app/util/environment-var-helper';

// ToDo: This file should be generated automatically during the build process.
// ToDo: It should be possible to build the SLO controller easily for multiple orchestrators.

// Load the KubeConfig and initialize the @polaris-sloc/kubernetes library.
const k8sConfig = new KubeConfig();
k8sConfig.loadFromDefault();
const polarisRuntime = initPolarisKubernetes(k8sConfig);

// Initialize the Prometheus query backend.
const promHost = getEnvironmentVariable('PROMETHEUS_HOST') || 'localhost';
const promPort = getEnvironmentVariable('PROMETHEUS_PORT', convertToNumber) || 9090
initPrometheusQueryBackend(polarisRuntime, { host: promHost, port: promPort }, true);

// Initialize the used Polaris mapping libraries
initCommonMappingsLib(polarisRuntime);

// Initialize the composed metrics
initCostEfficiencyMetrics(polarisRuntime);

// Create an SloControlLoop and register the factories for the ServiceLevelObjectives it will handle
const sloControlLoop = polarisRuntime.createSloControlLoop();
sloControlLoop.microcontrollerFactory.registerFactoryFn(CostEfficiencySloMappingSpec, () => new CostEfficiencySlo());

// Create an SloEvaluator and start the control loop with an interval of 20 seconds.
const sloEvaluator = polarisRuntime.createSloEvaluator();
sloControlLoop.start({
    evaluator: sloEvaluator,
    interval$: interval(20000),
});

// Create a WatchManager and watch the supported SLO mapping kinds.
const watchManager = polarisRuntime.createWatchManager();
watchManager.startWatchers([ new CostEfficiencySloMapping().objectKind ], sloControlLoop.watchHandler)
    .catch(error => void console.error(error))

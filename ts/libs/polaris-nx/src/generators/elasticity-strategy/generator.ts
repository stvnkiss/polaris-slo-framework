import * as path from 'path';
import {
    Generator,
    GeneratorCallback,
    Tree,
    formatFiles,
    generateFiles,
    joinPathFragments,
    names,
    readProjectConfiguration,
} from '@nrwl/devkit';
import {
    adaptTsConfigForPolaris,
    addExports,
    addPolarisDependenciesToPackageJson,
    createLibProject,
    getElasticityStrategyNames,
    runCallbacksSequentially,
} from '../../util';
import { addOrExtendInitFn } from '../common';
import { ElasticityStrategyGeneratorNormalizedSchema, ElasticityStrategyGeneratorSchema } from './schema';

/**
 * Generates a new Polaris ElasticityStrategy type.
 */
const generateElasticityStrategyType: Generator<ElasticityStrategyGeneratorSchema> = async (host: Tree, options: ElasticityStrategyGeneratorSchema) => {
    const callbacks: GeneratorCallback[] = [];

    if (options.createLibProject) {
        callbacks.push(await createLibProject(host, { projectName: options.project, importPath: options.importPath }));
    }

    const normalizedOptions = normalizeOptions(host, options);

    // Add required packages to package.json, if necessary.
    callbacks.push(addPolarisDependenciesToPackageJson(host));

    // Adapt tsconfig to allow decorators.
    adaptTsConfigForPolaris(host);

    // Generate the ElasticityStrategy type and the init-polaris-lib files.
    addElasticityStrategyFile(host, normalizedOptions);
    const initFnFileAdded = addOrExtendInitFn(host, normalizedOptions);

    // Add exports to .ts files.
    addExports(host, normalizedOptions, initFnFileAdded);

    await formatFiles(host);

    return runCallbacksSequentially(...callbacks);
}

// Export the generator function as the default export to enable integration with Nx.
export default generateElasticityStrategyType;

function normalizeOptions(host: Tree, options: ElasticityStrategyGeneratorSchema): ElasticityStrategyGeneratorNormalizedSchema {
    const projectConfig = readProjectConfiguration(host, options.project);
    const normalizedNames = names(options.name);
    const eStratNames = getElasticityStrategyNames(normalizedNames.className);

    return {
        names: normalizedNames,
        className: `${normalizedNames.className}`,
        projectName: options.project,
        projectSrcRoot: projectConfig.sourceRoot,
        destDir: joinPathFragments('lib', options.directory),
        destDirInLib: options.directory,
        fileName: eStratNames.eStratFileName,
    };
}

/**
 * Generates the ElasticityStrategy type.
 */
 export function addElasticityStrategyFile(host: Tree, options: ElasticityStrategyGeneratorNormalizedSchema): void {
    const eStratNames = getElasticityStrategyNames(options.className);

    const templateOptions = {
        ...eStratNames,
        template: '', // Used to replace '__template__' with an empty string in file names.
    };

    generateFiles(
        host,
        path.join(__dirname, 'files/elasticity-strategy'),
        joinPathFragments(options.projectSrcRoot, options.destDir),
        templateOptions,
    );
}

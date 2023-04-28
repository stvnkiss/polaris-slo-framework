import { GeneratorCallback, ProjectConfiguration, Tree, readProjectConfiguration } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { applicationGenerator } from '@nx/node';
import { NormalizedLibraryClassGeneratorSchema, NormalizedProjectGeneratorSchema } from './schema';
import { adaptLibModuleTypeForPolaris } from './ts-config';

/** Configuration for a project within an Nx CLI workspace. */
export type ProjectConfig = ProjectConfiguration;

/** Parameters for creating an application project. */
export interface AppProjectOptions {
    projectName: string;
    directory?: string;
    tags?: string;
}

/** Parameters for creating a library project. */
export interface LibProjectOptions {
    projectName: string;
    importPath: string;
}

/**
 * Changes the build configuration to bundle all external dependencies into the output js file.
 */
export function changeBuildDependencyBundling(projectConfig: ProjectConfig): void {
    const options = projectConfig.targets['build'].options as { externalDependencies: 'none' | 'all' | string[] };
    options.externalDependencies = 'none';
}

/**
 * Adds a `deploy` target to the project's configuration to allow deploying the controller to an orchestrator.
 */
export function addDeployTarget(projectConfig: ProjectConfig, options: NormalizedProjectGeneratorSchema): void {
    projectConfig.targets['deploy'] = {
        executor: 'nx:run-commands',
        options: {
            commands: [
                // Allows specifying the destination context, but if user does not specify the destination, its string value is 'undefined'
                // `kubectl apply --context='{args.destination}' -f ./${options.projectRoot}/manifests/kubernetes`,
                `kubectl apply -f ./${options.projectRoot}/manifests/kubernetes`,
            ],
            parallel: false,
        },
    };
}

/**
 * Adds a `gen-crds` target to the library project's configuration.
 */
export function addGenCrdsTarget(projectConfig: ProjectConfig, options: NormalizedLibraryClassGeneratorSchema): void {
    if (!projectConfig.targets['gen-crds']) {
        projectConfig.targets['gen-crds'] = {
            executor: '@polaris-sloc/polaris-nx:generate-crds',
            options: {},
        };
    }
}

/**
 * Creates a new application project.
 *
 * Throws an error if the project already exists.
 */
export async function createAppProject(host: Tree, options: AppProjectOptions): Promise<GeneratorCallback> {
    let projectExists = false;
    try {
        projectExists = !!readProjectConfiguration(host, options.projectName);
    } catch (e) {}
    if (projectExists) {
        throw new Error(`Cannot create a new application project, because a project with the name ${options.projectName} already exists.`);
    }

    const ret: GeneratorCallback = await applicationGenerator(
        host,
        {
            name: options.projectName,
            directory: options.directory,
            tags: options.tags,
            bundler: 'webpack',
            framework: 'none',
            e2eTestRunner: 'none',
        },
    );

    return ret;
}

/**
 * Creates a new library project.
 *
 * Throws an error if the project already exists.
 */
export async function createLibProject(host: Tree, options: LibProjectOptions): Promise<GeneratorCallback> {
    let projectExists = false;
    try {
        projectExists = !!readProjectConfiguration(host, options.projectName);
    } catch (e) {}
    if (projectExists) {
        throw new Error(`Cannot create a new library project, because a project with the name ${options.projectName} already exists.`);
    }

    const ret = await libraryGenerator(
        host, {
            name: options.projectName,
            publishable: true,
            importPath: options.importPath,
            buildable: true,
            config: 'project',
        },
    );

    adaptLibModuleTypeForPolaris(host, options.projectName);
    return ret;
}

/**
 * Gets the project's source root directory.
 */
export function getProjectSrcRoot(projectConfig: ProjectConfiguration): string {
    return projectConfig.sourceRoot || projectConfig.root + '/src';
}

import { ObjectKind } from '../../../model';
import { Constructor } from '../../../util';

export class SlocTransformationError extends Error {}

/**
 * This type of error is thrown when there is a problem when transforming a SLOC object
 * into an orchestrator-specific plain object.
 */
export class SlocToOrchestratorTransformationError extends SlocTransformationError {

    constructor(public slocObj: any, message: string) {
        super(message);
    }

}

/**
 * This type of error is thrown when there is a problem when transforming an orchestrator-specific plain object
 * into a SLOC object.
 */
export class OrchestratorToSlocTransformationError extends SlocTransformationError {

    constructor(
        public slocType: Constructor<any>,
        public orchPlainObj: any,
        message: string,
    ) {
        super(message);
    }

}

/**
 * This type of error is thrown when trying to derive the SLOC type that corresponds to the `ObjectKind`
 * specified in the orchestrator-specific plain object.
 */
export class UnknownObjectKindError extends SlocTransformationError {

    constructor(
        public kind: ObjectKind,
        public orchPlainObj: any,
        message: string,
    ) {
        super(message);
    }

}
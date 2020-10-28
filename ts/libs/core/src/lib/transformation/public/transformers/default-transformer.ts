import { classToPlain, plainToClass } from 'class-transformer';
import { Constructor, InterfaceOf } from '../../../util';
import { SlocTransformer } from '../common';
import { SlocTransformationService } from '../service';

/**
 * This transformer does not alter the structure of the objects, it just performs a simple
 * `class instance` <--> `plain object` conversion.
 *
 * This transformer is used by default, if no specific tranformer has been registered for a type.
 */
export class DefaultTransformer<T> implements SlocTransformer<T, InterfaceOf<T>> {

    transformToSlocObject(slocType: Constructor<T>, orchPlainObj: InterfaceOf<T>, transformationService: SlocTransformationService): T {
        return plainToClass(slocType, orchPlainObj);
    }

    transformToOrchestratorPlainObject(slocObj: T, transformationService: SlocTransformationService): InterfaceOf<T> {
        return classToPlain(slocObj) as any;
    }

}

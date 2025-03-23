import { ZodEffects } from 'zod';
import { C as Config } from '../config-By0ZyuRp.js';

declare module "zod" {
    interface ZodString {
        hexaurl(config?: Config, byteSize?: number): ZodEffects<ZodString, string, string>;
    }
}

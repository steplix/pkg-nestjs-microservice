import { Injectable } from '@nestjs/common';
import { type HealthEntity } from './entities';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pkg = require(`${process.cwd()}/package.json`);

@Injectable()
export class HealthService {
    async check (): Promise<HealthEntity> {
        const res: HealthEntity = {
            alive: true,
            name: pkg.name,
            version: pkg.version ?? '1.0.0',
            environment: process.env.NODE_ENV ?? 'development'
        };

        return res;
    }
}

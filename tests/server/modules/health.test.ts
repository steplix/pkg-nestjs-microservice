import { Test } from '@nestjs/testing';
import { TerminusModule } from '@nestjs/terminus';
import { ServiceHealthIndicator } from '../../../src/services';
import { HealthEntity } from '../../../src/server/modules/health/entities';
import {
  HealthController,
  HealthService
} from '../../../src/server/modules/health';
import { LoggerMock } from '../../mocks';

const pkg = require('../../../package.json');

describe('Health', () => {
    //
    // variables
    //
    let controller: HealthController;
    let service: HealthService;

    //
    // hooks
    //
    beforeEach(async () => {
        // Create Nest application and compile module
        const app = await Test.createTestingModule({
            imports: [TerminusModule],
            controllers: [HealthController],
            providers: [HealthService, ServiceHealthIndicator],
        }).compile();

        // Apply mocks
        app.useLogger(new LoggerMock());

        // Get Controller from module
        controller = app.get<HealthController>(HealthController);

        // Get Service from module
        service = app.get<HealthService>(HealthService);
    });

    //
    // tests
    //
    describe('definition', () => {

        it('Controller - should be defined', () => {
            expect(controller).toBeDefined();
        });

        // -------------------------------------------------------------------------

        it('Service - should be defined', () => {
            expect(service).toBeDefined();
        });

    });

    // -----------------------------------------------------------------------------

    describe('healthCheck', () => {

        it('should return an object with health check success status', async () => {
            const result: HealthEntity = {
                alive: true,
                name: pkg.name,
                version: pkg.version,
                environment: 'test'
            };

            expect(await controller.healthCheck('')).toEqual(result);
        });
    });
});

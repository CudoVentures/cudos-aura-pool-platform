import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';

describe('ContractEventWorker (e2e)', () => {

    beforeEach(async () => {

    });

    it('/ (GET)', () => {
        return request(app.getHttpServer())
            .get('/')
            .expect(200)
            .expect('Hello World!');
    });
});

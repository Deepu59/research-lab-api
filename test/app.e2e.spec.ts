import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';

describe('Research Lab API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DB_PATH = ':memory:'; // fresh in-memory database for the tests
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects an experiment without a name', async () => {
    await request(app.getHttpServer())
      .post('/experiments')
      .send({ hypothesis: 'no name given' })
      .expect(400);
  });

  it('creates an experiment, logs runs and reports statistics', async () => {
    const created = await request(app.getHttpServer())
      .post('/experiments')
      .send({ name: 'Speed vs voltage', parameters: { motor: 'BO' } })
      .expect(201);
    const id = created.body.id;

    for (const speed of [1, 2, 3]) {
      await request(app.getHttpServer())
        .post(`/experiments/${id}/runs`)
        .send({ measurements: { speed } })
        .expect(201);
    }

    const stats = await request(app.getHttpServer())
      .get(`/experiments/${id}/stats`)
      .expect(200);
    expect(stats.body.runCount).toBe(3);
    expect(stats.body.measurements.speed.mean).toBe(2);
  });

  it('rejects non-numeric measurements', async () => {
    const created = await request(app.getHttpServer())
      .post('/experiments')
      .send({ name: 'Bad data test' });
    await request(app.getHttpServer())
      .post(`/experiments/${created.body.id}/runs`)
      .send({ measurements: { speed: 'fast' } })
      .expect(400);
  });

  it('imports and exports CSV', async () => {
    const created = await request(app.getHttpServer())
      .post('/experiments')
      .send({ name: 'CSV test' });
    const id = created.body.id;

    const imported = await request(app.getHttpServer())
      .post(`/experiments/${id}/runs/import`)
      .attach('file', Buffer.from('speed,voltage\n1,7\n2,6.5\n'), 'data.csv')
      .expect(201);
    expect(imported.body).toEqual({ imported: 2 });

    const exported = await request(app.getHttpServer())
      .get(`/experiments/${id}/runs/export`)
      .expect(200);
    expect(exported.text).toBe('speed,voltage,notes\n1,7,\n2,6.5,\n');
  });

  it('returns 404 for unknown experiments and after deletion', async () => {
    await request(app.getHttpServer()).get('/experiments/9999').expect(404);

    const created = await request(app.getHttpServer())
      .post('/experiments')
      .send({ name: 'To be deleted' });
    const id = created.body.id;
    await request(app.getHttpServer()).delete(`/experiments/${id}`).expect(204);
    await request(app.getHttpServer()).get(`/experiments/${id}`).expect(404);
  });
});

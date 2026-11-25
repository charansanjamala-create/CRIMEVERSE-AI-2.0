import request from 'supertest';
import app from '../server';

describe('Authentication', () => {
  const testUser = { name: 'Test User', email: 'test@crimeverse.test', password: 'TestPass@2024!' };
  let authToken: string;

  it('POST /api/auth/register — should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    authToken = res.body.token;
  });

  it('POST /api/auth/register — should reject duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login — should login successfully', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: testUser.password });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  it('POST /api/auth/login — should reject wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/login').send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('GET /api/auth/me — should return current user with valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send(testUser);
    authToken = reg.body.token;
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('GET /api/auth/me — should reject request without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Cases API', () => {
  let authToken: string;
  let caseId: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Test Agent', email: 'agent@test.com', password: 'TestPass@2024!' });
    authToken = reg.body.token;
  });

  it('POST /api/cases — should create a new case', async () => {
    const res = await request(app).post('/api/cases').set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Case Alpha', description: 'A test investigation case', priority: 'HIGH' });
    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe('Test Case Alpha');
    caseId = res.body.data._id;
  });

  it('GET /api/cases — should return list of cases', async () => {
    const res = await request(app).get('/api/cases').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('GET /api/cases/:id — should return case by id', async () => {
    const create = await request(app).post('/api/cases').set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Case B', description: 'Another case', priority: 'MEDIUM' });
    const res = await request(app).get(`/api/cases/${create.body.data._id}`).set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe('Case B');
  });

  it('PUT /api/cases/:id — should update a case', async () => {
    const create = await request(app).post('/api/cases').set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Case C', description: 'Update test', priority: 'LOW' });
    const res = await request(app).put(`/api/cases/${create.body.data._id}`).set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'ACTIVE', priority: 'HIGH' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ACTIVE');
  });
});

describe('Email Analysis API', () => {
  let authToken: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Analyst', email: 'analyst2@test.com', password: 'TestPass@2024!' });
    authToken = reg.body.token;
  });

  it('POST /api/email/analyze — should analyze email content', async () => {
    const emailContent = `From: suspicious@tempmail.io\nSubject: URGENT bitcoin transfer\nTo: victim@example.com\n\nSend 0.5 BTC to 0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f now!`;
    const res = await request(app).post('/api/email/analyze').set('Authorization', `Bearer ${authToken}`)
      .send({ content: emailContent });
    expect(res.status).toBe(201);
    expect(res.body.data.threatScore).toBeGreaterThan(0);
    expect(res.body.data.extractedWallets.length).toBeGreaterThan(0);
  });

  it('POST /api/email/analyze — should reject empty content', async () => {
    const res = await request(app).post('/api/email/analyze').set('Authorization', `Bearer ${authToken}`).send({ content: '' });
    expect(res.status).toBe(400);
  });
});

describe('Blockchain Analysis API', () => {
  let authToken: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Chain', email: 'chain@test.com', password: 'TestPass@2024!' });
    authToken = reg.body.token;
  });

  it('POST /api/blockchain/analyze — should analyze wallet', async () => {
    const res = await request(app).post('/api/blockchain/analyze').set('Authorization', `Bearer ${authToken}`)
      .send({ walletAddress: '0x7a2f8e9b3c1d4a5f6e7b8c9d0e1f2a3b4c5d6e7f', blockchain: 'ETH' });
    expect(res.status).toBe(201);
    expect(res.body.data.riskScore).toBeGreaterThanOrEqual(0);
    expect(res.body.data.transactions).toBeDefined();
  });
});

describe('AI Chat API', () => {
  let authToken: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'AI User', email: 'ai@test.com', password: 'TestPass@2024!' });
    authToken = reg.body.token;
  });

  it('POST /api/ai/chat — should return AI response', async () => {
    const res = await request(app).post('/api/ai/chat').set('Authorization', `Bearer ${authToken}`)
      .send({ message: 'What can you help me with?' });
    expect(res.status).toBe(200);
    expect(res.body.data.message.content).toBeDefined();
    expect(res.body.data.sessionId).toBeDefined();
  });
});

describe('Dashboard API', () => {
  let authToken: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/auth/register').send({ name: 'Dashboard', email: 'dash@test.com', password: 'TestPass@2024!' });
    authToken = reg.body.token;
  });

  it('GET /api/dashboard/stats — should return stats', async () => {
    const res = await request(app).get('/api/dashboard/stats').set('Authorization', `Bearer ${authToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.overview).toBeDefined();
    expect(res.body.data.trendData).toBeDefined();
  });
});

describe('Health Check', () => {
  it('GET /health — should return healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

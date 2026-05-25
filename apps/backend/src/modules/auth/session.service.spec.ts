import { SessionService } from './session.service';

describe('SessionService', () => {
  const ORIG_ENV = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-please-change';
  });

  afterAll(() => {
    process.env.JWT_SECRET = ORIG_ENV;
  });

  it('signs a token that round-trips through verify', () => {
    const svc = new SessionService();
    const token = svc.sign({ userId: 'u_123' });
    const payload = svc.verify(token);
    expect(payload?.userId).toBe('u_123');
    expect(payload?.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejects a token signed with a different secret', () => {
    const svc = new SessionService();
    const token = svc.sign({ userId: 'u_123' });

    process.env.JWT_SECRET = 'a-different-secret';
    const svc2 = new SessionService();
    expect(svc2.verify(token)).toBeNull();
  });

  it('rejects expired tokens', () => {
    const svc = new SessionService();
    const token = svc.sign({ userId: 'u_123', ttlSeconds: -10 });
    expect(svc.verify(token)).toBeNull();
  });

  it('rejects malformed tokens', () => {
    const svc = new SessionService();
    expect(svc.verify(undefined)).toBeNull();
    expect(svc.verify('')).toBeNull();
    expect(svc.verify('not-a-token')).toBeNull();
    expect(svc.verify('only.one.dot')).toBeNull();
  });
});

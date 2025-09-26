import * as assert from 'assert';
import * as fft from 'firebase-functions-test';

const testEnv = (fft as any).default ? (fft as any).default() : (fft as any)();
const socialTokens = require('../src/social-tokens');

async function run() {
  const results: { name: string; ok: boolean; error?: any }[] = [];
  async function test(name: string, fn: () => Promise<void>) {
    try { await fn(); results.push({ name, ok: true }); }
    catch (e) { results.push({ name, ok: false, error: e }); }
  }

  await test('rejects missing platform', async () => {
    const wrapped = testEnv.wrap(socialTokens.getSocialAccessToken);
    await assert.rejects(() => wrapped({}, { auth: { uid: 'u1' } } as any), /platform is required/);
  });

  await test('rejects unauthenticated when not emulator', async () => {
    const wrapped = testEnv.wrap(socialTokens.getSocialAccessToken);
    const prev = process.env.FUNCTIONS_EMULATOR;
    delete process.env.FUNCTIONS_EMULATOR;
    await assert.rejects(() => wrapped({ platform: 'facebook' }, {} as any), /Authentication required/);
    if (prev) process.env.FUNCTIONS_EMULATOR = prev;
  });

  await test('returns token when authenticated (emulator mode)', async () => {
    const wrapped = testEnv.wrap(socialTokens.getSocialAccessToken);
    process.env.FUNCTIONS_EMULATOR = 'true';
    process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN = 'FAKE_FACEBOOK_TOKEN_TEST';
    const result = await wrapped({ platform: 'facebook' }, { auth: { uid: 'user1' } } as any);
    assert.strictEqual(result.token, 'FAKE_FACEBOOK_TOKEN_TEST');
    assert.strictEqual(result.platform, 'facebook');
    assert.ok(typeof result.expiresIn === 'number');
    assert.ok(result.issuer, 'issuer should be defined');
  });

  await test('env fallback still works when secret manager disabled', async () => {
    delete process.env.ENABLE_SECRET_MANAGER; // ensure disabled
    const wrapped = testEnv.wrap(socialTokens.getSocialAccessToken);
    process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN = 'IG_TOKEN_ABC';
    const result = await wrapped({ platform: 'instagram' }, { auth: { uid: 'u_ig' } } as any);
    assert.strictEqual(result.token, 'IG_TOKEN_ABC');
  });

  await test('ephemeral wrapping returns opaque token in production mode', async () => {
    // Force reload of module with new env flags
    process.env.ENABLE_EPHEMERAL_TOKENS = '1';
    process.env.NODE_ENV = 'production';
    process.env.REACT_APP_TIKTOK_ACCESS_TOKEN = 'TIKTOK_LONG_TOKEN_XYZ';
    delete require.cache[require.resolve('../src/social-tokens')];
    const fresh = require('../src/social-tokens');
    const wrapped = testEnv.wrap(fresh.getSocialAccessToken);
    const result = await wrapped({ platform: 'tiktok' }, { auth: { uid: 'u_tt' } } as any);
    assert.ok(result.wrapped, 'wrapped flag should be true');
    assert.ok(result.ephemeral?.value, 'ephemeral value present');
    assert.notStrictEqual(result.token, 'TIKTOK_LONG_TOKEN_XYZ');
    assert.strictEqual(result.rawIncluded, false);

    const verify = fresh.verifyEphemeralToken(result.token);
    assert.ok(verify.valid, 'ephemeral token should verify');
    assert.strictEqual(verify.platform, 'tiktok');
  });

  await test('ephemeral verification fails with tampered signature', async () => {
    const mod = require('../src/social-tokens');
    const chg = 'AAA';
    const bad = 'XXXX.' + chg;
    const res = mod.verifyEphemeralToken(bad);
    assert.ok(!res.valid, 'should be invalid');
  });

  await test('ephemeral token expiration detection', async () => {
    // fabricate an already expired token
    const mod = require('../src/social-tokens');
    const pastExp = Date.now() - 1000;
    const payload = JSON.stringify({ p: 'facebook', iat: pastExp - 5000, exp: pastExp, v: 1 });
    const hmac = require('crypto').createHmac('sha256', process.env.EPHEMERAL_SIGNING_SECRET || 'dev-insecure-secret-change').update(payload).digest('base64url');
    const token = Buffer.from(payload).toString('base64url') + '.' + hmac;
    const res = mod.verifyEphemeralToken(token);
    assert.ok(!res.valid && res.reason === 'expired', 'should detect expiration');
  });

  // Rate limit test (exceed per-user limit quickly)
  await test('rate limiting per user', async () => {
    const wrapped = testEnv.wrap(socialTokens.getSocialAccessToken);
    const limitAttempts = 15; // above configured 10
    let hit = false;
    for (let i = 0; i < limitAttempts; i++) {
      try {
        await wrapped({ platform: 'facebook' }, { auth: { uid: 'limited_user' } } as any);
      } catch (e: any) {
        if (e?.message && /Rate limit/i.test(e.message)) {
          hit = true;
          break;
        }
      }
    }
    assert.ok(hit, 'should hit rate limit for user');
  });

  const passed = results.filter(r => r.ok).length;
  const failed = results.length - passed;
  console.log(`Social Token Tests: ${passed} passed, ${failed} failed`);
  results.filter(r => !r.ok).forEach(r => console.error('FAIL', r.name, r.error));
  if (failed > 0) process.exit(1);
}

run();

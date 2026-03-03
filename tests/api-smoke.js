const assert = require('assert');

const run = async () => {
  const health = await fetch('http://localhost:3000/api/health').then((r) => r.json());
  assert.equal(health.status, 'ok');

  const content = await fetch('http://localhost:3000/api/content').then((r) => r.json());
  assert.ok(content.hero.title);
  assert.ok(Array.isArray(content.rows));

  const searchResp = await fetch('http://localhost:3000/api/search?q=dark');
  assert.equal(searchResp.status, 200);
  const search = await searchResp.json();
  assert.ok(search.count >= 1);

  const invalidSub = await fetch('http://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bad-email', plan: 'basic' })
  });
  assert.equal(invalidSub.status, 400);

  const validSub = await fetch('http://localhost:3000/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ok@example.com', plan: 'standard' })
  });
  assert.equal(validSub.status, 201);

  console.log('API smoke tests passed');
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

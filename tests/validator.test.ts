import { Validator } from '../src/validator';
import { MonbanConfig } from '../src/monban-config';

test('good-integer', async () => {
  const v = new Validator('tests/fixtures/good-integer.nt', new MonbanConfig());
  const r = await v.validate();

  expect(r.errors).toEqual([]);
});

test('bad-integer', async () => {
  const v = new Validator('tests/fixtures/bad-integer.nt', new MonbanConfig());
  const r = await v.validate();

  expect(r.errors).toHaveLength(1);
});

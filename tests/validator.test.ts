import { Validator } from '../src/validator';
import { MonbanConfig } from '../src/monban-config';

test('validate literal', async () => {
  const v = new Validator('tests/fixtures/literal.nt', new MonbanConfig());
  const r = await v.validate();

  expect(r.errors.size).toEqual(1);
  expect(Array.from(r.errors.values())[0].size).toEqual(7);
});

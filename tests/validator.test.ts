import { Validator } from '../src/validator';

test('validate', async () => {
  const v = new Validator();
  const r = await v.validate('tests/fixtures/good-integer.nt');

  expect(r.errors).toEqual([]);
});

import { Validator } from '../src/validator';

test('validate', async () => {
  const v = new Validator();
  const r: any = await v.validate('tests/fixtures/good-integer.nt');

  expect(r['errors']).toEqual([]);
});

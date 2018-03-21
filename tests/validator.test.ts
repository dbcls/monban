import { Validator } from '../src/validator';
import { MonbanConfig } from '../src/monban-config';
import { TripleReader } from '../src/triple-reader';

test('validate literal', async () => {
  const reader = TripleReader.fromFile('tests/fixtures/literal.nt');
  const v = new Validator(reader, new MonbanConfig());
  const r = await v.validate();

  expect(r.errors.size).toEqual(1);
  expect(Array.from(r.errors.values())[0].size).toEqual(7);
});

import { Validator } from '../src/validator';
import { MonbanConfig } from '../src/monban-config';
import { TripleReader } from '../src/triple-reader';
import { ValidationResults } from '../src/validation-results';

async function validate(input: string, config: MonbanConfig = new MonbanConfig()): Promise<ValidationResults> {
  const reader = TripleReader.fromString(input);
  const v = new Validator(reader, config);
  return await v.validate();
}

test('validate good literals', async () => {
  const goodLiterals = `
<http://example.com/s> <http://example.com/p> "42"^^<http://www.w3.org/2001/XMLSchema#int> .
<http://example.com/s> <http://example.com/p> "42.0"^^<http://www.w3.org/2001/XMLSchema#decimal> .
<http://example.com/s> <http://example.com/p> "4e-2"^^<http://www.w3.org/2001/XMLSchema#float> .
<http://example.com/s> <http://example.com/p> "gopher://example.com"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<http://example.com/s> <http://example.com/p> "2018-01-01"^^<http://www.w3.org/2001/XMLSchema#date> .
<http://example.com/s> <http://example.com/p> "00:42:42.0"^^<http://www.w3.org/2001/XMLSchema#time> .
<http://example.com/s> <http://example.com/p> "2018-01-01T00:42:42.0"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
<http://example.com/s> <http://example.com/p> "hello"^^<http://www.w3.org/2001/XMLSchema#string> .
<http://example.com/s> <http://example.com/p> "bye"^^<http://www.w3.org/2001/XMLSchema#_any-unknown-type> .
`;
  const r = await validate(goodLiterals);

  expect(r.errors.size).toEqual(0);
});

test('validate bad literals', async () => {
  const badLiterals = `
<http://example.com/s> <http://example.com/p> "42.0"^^<http://www.w3.org/2001/XMLSchema#int> .
<http://example.com/s> <http://example.com/p> "42..0"^^<http://www.w3.org/2001/XMLSchema#decimal> .
<http://example.com/s> <http://example.com/p> "4ee-2"^^<http://www.w3.org/2001/XMLSchema#float> .
<http://example.com/s> <http://example.com/p> "example.com"^^<http://www.w3.org/2001/XMLSchema#anyURI> .
<http://example.com/s> <http://example.com/p> "2018-01-42"^^<http://www.w3.org/2001/XMLSchema#date> .
<http://example.com/s> <http://example.com/p> "00:42:42..0"^^<http://www.w3.org/2001/XMLSchema#time> .
<http://example.com/s> <http://example.com/p> "2018-01-01T00:42:42..0"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
`;
  const r = await validate(badLiterals);

  expect(r.errors.size).toEqual(1);
  expect(r.errors.has('ErrorLiteralFormat')).toBeTruthy();
  expect(Array.from(r.errors.values())[0].size).toEqual(7);
});
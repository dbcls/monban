# Monban: A RDF Lint Tool & Aramashi: A tool for RDF statistics

## Prerequisites

* [Node.js](https://nodejs.org/) >= 8.10.0
* [Yarn](https://yarnpkg.com) >= 1.5.1

## Setup

    $ git clone https://github.com/dbcls/monban
    $ cd monban
    $ yarn install

## Monban

`monban` lints the file specified.

    $ ./bin/monban [target file (.nt, .ttl)]

### Options

#### `--primal-classes <path.txt>`

Path to primal classes definition. List classes one per line.

Example:

```
http://example.com/primaryClass1
http://example.com/primaryClass2
```

#### `--uri-whitelist <path.tsv>`

Path to white list definition for `rdfs:seeAlso` test. The file should be a Tab Separated Values (TSV) file.

* 1st column: label of the pattern
* 2nd column: RegExp of the pattern

Example:

```
Example1	^http://example\.com/1/
Example2	^http://example\.com/2/
```

#### `--uri-blacklist <path.tsv>`

Path to black list definition for `rdfs:seeAlso` test. The file should be a Tab Separated Values (TSV) file.

* 1st column: label of the pattern
* 2nd column: RegExp of the pattern

```
Example1	^http://example\.com/1/
Example2	^http://example\.com/2/
```

#### `--ontology <path.ttl>`

Path to ontology (in Turtle or N-Triples). This option can be specified multiple times.

```
Example1	^http://example\.com/1/
Example2	^http://example\.com/2/
```

#### `--bib-patterns <path.tsv>`

Path to bibliography resource patterns.

Example (this is the default):

```
PMC	^http://identifiers\.org/pmc/
PubMed	^http://identifiers\.org/pubmed/
DOI	^http://doi\.org/
```

#### `--report-limit <number>`

Number of error instances to report per error. If negative specified, no limit.

Default: 10

#### `--output-format <format>`

Output format. `json` and `markdown` are available.

Default: `markdown`

## Aramashi

`aramashi` computes RDF statistics of the file.

    $ ./bin/aramashi [target file (.nt, .ttl)]

### Option

#### `--link-patterns <path.tsv>`

Path to the link pattern definition. The file should be a Tab Separated Values (TSV) file.

* 1st column: label of the pattern
* 2nd column: RegExp of the pattern

Example:

```
DDBJ	^http://identifiers\.org/insdc/
KERO	^http://kero\.hgc\.jp/rdf/
```

## Aramashi-merge

`aramashi-merge` merges the outputs of `aramashi`.

    $ ./bin/aramashi-merge [target file (.json)]

This can be used for a large graph consists of many files; 1) use `aramashi` to compute the file-wise statistics, then 2) use `aramashi-merge` to merge the results. Example:

    $ ./bin/aramashi file1.ttl > file1.json
    $ ./bin/aramashi file2.ttl > file2.json
    $ ./bin/aramashi-merge file1.json file2.json > merged.json
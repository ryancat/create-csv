# csv-generator

A fast and simple CSV file generator. No dependencies and easy to config.

## Usage

`node generator.js --filename demo --column 'column 1' string 1000 --column 'column 2' number 500 --seed 111`

The above command will generate a file named 'demo' under same directory with generator.js. The file will contains two columns (namely `column 1` and `column 2`), The first column will contain 1000 string data, and the second will contain 500 number data. The total data point will be `1000 * 2 = 2000`, with the missing ones filled with `null`.

The same arguments will *always* generate the same csv file with pseudo-random data. You can optionally use `seed` option to control the random outcomes.

## Options

### --filename

* Default: `Date.now()`

The name of the file generated.

### --column

The column definition. The order should be `column header`, `data type` and `data count`. Please refer to example above.

### --seed

* Default: `1`

The pseudo-random seed. Same seed will always generate same set of data

## TODO

* Adding more configs based on feedback
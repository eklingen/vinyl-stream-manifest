
# Small vinyl-stream utility -aka Gulp plugin- to write a manifest.json

Calculate hashes, rename files in the stream, and write the results to a `manifest.json` file for consumption by, for example, a webserver. Also includes a function to take the manifest values and use them as string replacements in a stream - such as templates.

> *NOTE*: No tests have been written yet!

## Installation

`yarn install`. Or `npm install`. Or just copy the files to your own project.

## Usage

To add a content hash to files, and write the results to a `manifest.json` file:

```javascript
const { writeToManifest } = require('@eklingen/vinyl-stream-manifest')
return stream.pipe(writeToManifest('build/static/manifest.json'))
```

To replace occurances of unhashed filenames with the hashed filenames from a `manifest.json` file:

```javascript
const { replaceByManifest } = require('@eklingen/vinyl-stream-manifest')
return stream.pipe(replaceByManifest('build/static/manifest.json'))
```

An example of a `manifest.json`:

```json
{
  "scripts/base.js": "scripts/base.657a510220605b17ae0177107375884f7f9ff796.js",
  "scripts/main.js": "scripts/main.1ca16ef0071daa93373291c9febac0e0526f6b0d.js",
  "scripts/base.js.map": "scripts/base.657a510220605b17ae0177107375884f7f9ff796.js.map",
  "scripts/main.js.map": "scripts/main.1ca16ef0071daa93373291c9febac0e0526f6b0d.js.map",
  "stylesheets/main.css": "stylesheets/main.4f1aec7e4c3ff593e2b0ee60c0d4e249e685011e.css"
}
```

## Options

You have the following options:

### `streamDestination`

This is necessary if the files do not reside in the same location as the `manifest.json` file. Since the files in the stream haven't been written yet, they do not contain a path (`gulp.dest()` adds that at the end). Specifying the destination allows the relative paths to resolve correctly. This does assume that all files in the current stream reside in (starting from) the same folder you specify, which is usually the case in a gulp stream.

For example, if the stream contains `.js` files that reside in `build/static/scripts`, while the `manifest.json` will be written to `build/static/manifest.json`, the usage would be like so:

```javascript
replaceByManifest('build/static/manifest.json', { streamDestination: 'build/static/scripts' })
```

> *NOTE*: If (some of) the files in the stream _do_ contain a path, then they will resolve correctly without specifying a streamDestination.

## Dependencies

None.

---

Copyright (c) 2021 Elco Klingen. MIT License.

// Vinyl-stream utility to provide a manifest.json for consumption by, for example, a webserver.
// No dependencies. Creates a manifest.json if it doesn't already exist. Adds a hash to the filename after the first dot.

// Most of these functions only work on Vinyl Buffer objects.
// They have only been tested on Vinyl Buffer objects.

// Call manifest(<dest>) to create (or add to existing) manifest.json.

const { createHash } = require('crypto')
const { existsSync, readFileSync, writeFileSync, mkdirSync } = require('fs')
const { resolve, join, relative, dirname } = require('path')
const { Transform } = require('stream')

const DEFAULT_OPTIONS = {
  streamDestination: ''
}

const CACHE = {}

let manifest = {}

function loadManifestFromDisk (manifestPath) {
  if (existsSync(manifestPath)) {
    return JSON.parse(readFileSync(manifestPath))
  }

  return {}
}

function saveManifestToDisk (manifest, manifestPath) {
  mkdirSync(dirname(manifestPath), { recursive: true })
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
}

function writeToManifest (manifestPath = './manifest.json', options = {}) {
  options = { ...DEFAULT_OPTIONS, ...options }

  manifestPath = resolve(process.cwd(), manifestPath)
  manifest = loadManifestFromDisk(manifestPath)

  function transform (file, encoding, callback) {
    if (!file.isBuffer() || !file.contents || !file.contents.length) {
      return callback(null, file)
    }

    let filehash = ''

    // If it's a source map, then assume the source file already passed, so we should have it in the cache object. Reuse that hash if we can.
    if (file.extname === '.map' && CACHE[file.path.substr(0, file.path.length - 4)]) {
      filehash = CACHE[file.path.substr(0, file.path.length - 4)]
    } else {
      filehash = createHash('sha1').update(file.contents.toString('utf8')).digest('hex').toString('utf8')
    }

    const basenameHashed = file.basename.replace(/^([^.]*)\.(.+)$/g, `$1.${filehash}.$2`)
    const filepathRelativeToManifestPath = relative(dirname(manifestPath), join(options.streamDestination, file.relative))
    const filepathRelativeHashed = filepathRelativeToManifestPath.replace(file.basename, basenameHashed)

    if (manifest[file.relative]) {
      delete manifest[file.relative]
    }

    if (manifest[filepathRelativeToManifestPath] && manifest[filepathRelativeToManifestPath] === filepathRelativeHashed) {
      return callback()
    }

    CACHE[file.path] = filehash
    file.basename = basenameHashed
    manifest[filepathRelativeToManifestPath] = filepathRelativeHashed
    saveManifestToDisk(manifest, manifestPath)

    return callback(null, file)
  }

  return new Transform({ transform, readableObjectMode: true, writableObjectMode: true })
}

function replaceByManifest (manifestPath = './manifest.json') {
  manifestPath = resolve(process.cwd(), manifestPath)
  manifest = loadManifestFromDisk(manifestPath)

  function transform (file, encoding, callback) {
    if (!file.isBuffer() || !file.contents || !file.contents.length) {
      return callback(null, file)
    }

    if (!Object.keys(manifest).length) {
      return callback(null, file)
    }

    let contents = file.contents.toString('utf8')

    for (const filepath in manifest) {
      contents = contents.replace(filepath, manifest[filepath])
    }

    file.contents = Buffer.from(contents)

    return callback(null, file)
  }

  return new Transform({ transform, readableObjectMode: true, writableObjectMode: true })
}

module.exports = { writeToManifest, replaceByManifest }

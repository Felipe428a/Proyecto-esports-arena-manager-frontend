// Plugin de esbuild para Karma: instrumenta el código de src/ con Istanbul (cobertura).
// Las pruebas (*.spec.js) y las ayudas de src/pruebas no se instrumentan.
const fs = require('fs')
const path = require('path')
const esbuild = require('esbuild')
const { createInstrumenter } = require('istanbul-lib-instrument')

module.exports = function istanbulPlugin() {
  const instrumentador = createInstrumenter({ esModules: true, compact: false, produceSourceMap: false })
  return {
    name: 'istanbul',
    setup(build) {
      build.onLoad({ filter: /[\\/]src[\\/].*\.jsx?$/ }, async (args) => {
        const relativo = args.path.split(path.sep).join('/')
        if (/\.spec\.jsx?$/.test(relativo) || relativo.includes('/src/pruebas/')) return undefined
        const fuente = await fs.promises.readFile(args.path, 'utf8')
        const { code } = await esbuild.transform(fuente, {
          loader: 'jsx',
          jsx: 'automatic',
          format: 'esm',
          sourcefile: args.path,
          define: { 'import.meta.env': '{"BASE_URL":"/"}' },
        })
        return { contents: instrumentador.instrumentSync(code, args.path), loader: 'js' }
      })
    },
  }
}

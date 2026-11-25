// Configuración de Karma según Guía de React (Sección 20)

const istanbulPlugin = require('./karma/esbuild-istanbul.cjs')

module.exports = function (config) {
  const conCobertura = Boolean(config.coverage)

  config.set({
    // Carpeta base desde donde se resuelven las rutas
    basePath: '',

    // Jasmine aporta describe, it, expect y los espías
    frameworks: ['jasmine'],

    // Archivos que Karma carga en el navegador
    files: [{ pattern: 'src/**/*.spec.js*', watched: false, type: 'module' }],

    // esbuild traduce JSX y resuelve los import antes de enviarlos al navegador
    preprocessors: { 'src/**/*.spec.js*': ['esbuild'] },

    esbuild: {
      target: 'es2022',
      jsx: 'automatic', // permite escribir JSX sin importar React
      loader: { '.js': 'jsx' },
      // Vite define import.meta.env; en las pruebas (sin Vite) se entrega un valor fijo
      define: { 'import.meta.env': '{"BASE_URL":"/"}' },
      // Solo al pedir cobertura se instrumenta el código de src/
      plugins: conCobertura ? [istanbulPlugin()] : [],
    },

    // Cómo se muestran los resultados en la terminal
    reporters: conCobertura ? ['progress', 'coverage'] : ['progress'],

    // Reporte de cobertura: tabla por archivo en la terminal + HTML navegable en coverage/
    coverageReporter: {
      dir: 'coverage',
      subdir: '.',
      reporters: [
        { type: 'text' },
        { type: 'text-summary' },
        { type: 'html' },
        { type: 'lcovonly' },
      ],
    },

    // Navegador donde corren las pruebas (sin ventana)
    browsers: ['ChromeHeadlessNoSandbox'],

    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      },
    },

    // true: corre una vez y termina
    singleRun: true,
    autoWatch: false,

    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    concurrency: 1,
  })
}

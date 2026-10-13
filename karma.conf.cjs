// Configuración de Karma según Guía de React (Sección 20)
process.env.CHROME_BIN = process.env.CHROME_BIN || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

module.exports = function (config) {
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
    },

    // Cómo se muestran los resultados en la terminal
    reporters: ['progress'],

    // Navegador donde corren las pruebas
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

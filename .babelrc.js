const env = require('./env-config');

module.exports = {
  'env': {
    'production': {
      presets: [
        ['@babel/preset-env', { modules: 'commonjs' }],
        '@babel/stage-3',
        '@babel/typescript',
      ],
      'plugins': [
        [ 'transform-define', env ],
        [ 'module-resolver', {
          'extenions': ['.js', '.jsx', '.ts', '.tsx'],
          'root': ['./src']
        }]
      ]
    },
    'test': {
      presets: [
        ['@babel/preset-env', { modules: false }],
        '@babel/stage-3',
        '@babel/typescript',
      ],
      'plugins': [
        [ 'transform-define', env ],
        [ 'module-resolver', {
          'extenions': ['.js', '.jsx', '.ts', '.tsx'],
          'root': ['./src']
        }]
      ],
    }
  }
}
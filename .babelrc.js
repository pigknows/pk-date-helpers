module.exports = {
  'env': {
    'production': {
      presets: [
        ['@babel/preset-env', { modules: 'commonjs' }],
        '@babel/preset-stage-3',
        '@babel/preset-typescript',
      ],
      'plugins': [
        [ 'babel-plugin-module-resolver', {
          'extenions': ['.js', '.jsx', '.ts', '.tsx'],
          'root': ['./src']
        }]
      ]
    },
    'test': {
      presets: [
        ['@babel/preset-env', { modules: 'commonjs'}],
        '@babel/preset-stage-3',
        '@babel/preset-typescript',
      ],
      'plugins': [
        [ 'babel-plugin-module-resolver', {
          'extenions': ['.js', '.jsx', '.ts', '.tsx'],
          'root': ['./src']
        }]
      ],
    }
  }
}
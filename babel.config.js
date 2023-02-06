module.exports = {
  preset: [
    [
      'babel/preset-env',
      {
        tartgets: { node: 'current' },
      },
    ],
    '@babel/preset-typescript',
  ],
};

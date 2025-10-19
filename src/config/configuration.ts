export default () => ({
  api: {
    baseUrl:
      process.env.API_BASE_URL || 'https://assessment.ksensetech.com/api',
    apiKey:
      process.env.API_KEY ||
      'ak_27661c1f610628248b2c8768d58644f4e5f6b36109d2c6ed',
  },
});

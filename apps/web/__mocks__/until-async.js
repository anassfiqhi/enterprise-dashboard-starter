const until = async (promise) => {
  try {
    const data = await promise();
    return [null, data];
  } catch (error) {
    return [error, null];
  }
};

module.exports = { until };

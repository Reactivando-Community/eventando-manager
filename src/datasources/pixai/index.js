const axios = require("axios");

const makeRequest = async (method, path, body, headers) => {
  let config = {
    method: method,
    url: `https://manager.pixai.com.br/api${path}`,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...headers,
    },
  };

  if (body) {
    config.data = JSON.stringify(body);
  }

  try {
    let response = await axios.request(config);

    if (response) {
      return response.data;
    }
  } catch (err) {
    console.log("err: ", { err, config });

    if (err.response.data) {
      throw err.response.data;
    }
    throw new Error(`Failed to ${method} on ${path}`);
  }
};

const createPayment = async ({ value, description, token }) => {
  return makeRequest(
    "POST",
    "/integration/payment-initiation/",
    { amount: value, description },
    { Authorization: `Bearer ${token}` }
  );
};

const PixAiIntegration = {
  createPayment,
};

module.exports = PixAiIntegration;

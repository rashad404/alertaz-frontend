const axios = require('axios');

async function testCurrencyApi() {
  try {
    console.log('Testing currency calculation API...');
    
    const response = await axios.post('http://localhost:8000/api/az/currencies/calculate', {
      from_currency: 'USD',
      to_currency: 'AZN',
      amount: 100,
      operation: 'buy'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testCurrencyApi();
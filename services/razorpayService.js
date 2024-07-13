const fetch = (...args) =>
    import('node-fetch').then(({ default: fetch }) => fetch(...args));
  
  const apiKey = '';
  const apiSecret = '';
  const basicAuthCredentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');
  
  async function createRazorpayOrder(reqData) {
    try {
      const size = reqData.length;
      const updatedOrders = [];
  
      for (let i = 0; i < size; i++) {
        console.log(`Creating order for customer ${reqData[i].customer_id}`);
  
        const requestDataForRazorpay = {
          amount: reqData[i].amount,
          currency: 'INR',
          method: 'emandate',
          payment_capture: '1',
          customer_id: reqData[i].customer_id,
          token: {
            auth_type: reqData[i].auth_type,
            max_amount: reqData[i].max_amount,
            expire_at: reqData[i].expire_at,
            bank_account: {
              beneficiary_name: reqData[i].beneficiary_name,
              account_number: reqData[i].account_number,
              account_type: reqData[i].account_type,
              ifsc_code: reqData[i].ifsc_code,
            },
          },
          receipt: reqData[i].receipt,
        };
  
        const init = {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuthCredentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestDataForRazorpay),
          redirect: 'follow',
        };
  
        const response = await fetch('https://api.razorpay.com/v1/orders', init);
        const responseBody = await response.json();
  
        if (!response.ok) {
          console.error('Error creating order:', responseBody);
          throw new Error('Error creating order');
        }
  
        console.log('Razorpay Response:', responseBody);
  
        const fetchedData = await fetchABCData(reqData[i].customer_id, reqData[i].year);
        console.log(`Data for ${reqData[i].year}  & ${reqData[i].customer_id}:`, fetchedData);
  
        const sendJsonData = {
          customer_id: reqData[i].customer_id,
          method: 'emandate',
          payment_capture: '1',
          auth_type: reqData[i].auth_type,
          max_amount: reqData[i].max_amount,
          expire_at: reqData[i].expire_at,
          beneficiary_name: reqData[i].beneficiary_name,
          account_number: reqData[i].account_number,
          account_type: reqData[i].account_type,
          ifsc_code: reqData[i].ifsc_code,
          receipt: reqData[i].receipt,
          date_of_presentation: reqData[i].date_of_presentation,
          status_after_presentation: reqData[i].status_after_presentation,
          order_id: responseBody.id,
          year: reqData[i].year
        };
  
        const updated_order = await processNACHData(sendJsonData);
        updatedOrders.push(updated_order);
      }
  
      return updatedOrders;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }
  
  async function createRecurringPayment(reqData) {
    try {
      const responseData = [];
  
      for (const data of reqData) {
        const init = {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuthCredentials}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          redirect: 'follow',
        };
  
        console.log("Request Data:", data);
        const response = await fetch('https://api.razorpay.com/v1/payments/create/recurring', init);
        const responseBody = await response.json();
  
        if (!response.ok) {
          console.error('Error creating recurring payment:', responseBody);
          throw new Error('Error creating recurring payment');
        } else {
          const responseDataItem = {
            success: true,
            data: responseBody,
          };
          responseData.push(responseDataItem);
          console.log("Response Data:", responseDataItem);
        }
      }
  
      return responseData;
    } catch (error) {
      console.error('Error creating recurring payment:', error);
      throw error;
    }
  }
  
  module.exports = {
    createRazorpayOrder,
    createRecurringPayment,
  };
  
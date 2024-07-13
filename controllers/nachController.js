const { storeData, fetchABCData, processNACHData, DataFromSQL, populateDynamoDB } = require('../services/dynamoService');
const { createRazorpayOrder, createRecurringPayment } = require('../services/razorpayService');

// Endpoint handlers
const sendJson = async (req, res) => {
  const NACH_data = req.body;

  if (!NACH_data) {
    return res.status(400).json({ success: false, error: 'Missing data in request body' });
  }

  try {
    const success = await processNACHData(NACH_data);

    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: 'Failed to store data' });
    }
  } catch (error) {
    console.error('Error processing /send-json endpoint:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const fetchData = async (req, res) => {
  try {
    const params = {
      TableName: "nach-presentation",
    };
    const data = await docClient.scan(params).promise();
    res.json(data.Items);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ success: false, error: 'Error fetching data' });
  }
};

const fetchDataABC = async (req, res) => {
  const partition_key = req.query.partition_key;
  const sort_key = req.query.sort_key;

  if (!partition_key || !sort_key) {
    return res.status(400).json({ success: false, error: 'Missing partition_key parameter or sort_key' });
  }

  try {
    const data = await fetchABCData(partition_key, sort_key);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching data with nach_ID ${partition_key}:`, error);
    res.status(500).json({ success: false, error: 'Error fetching data' });
  }
};

const createOrder = async (req, res) => {
  try {
    const orders = await createRazorpayOrder(req.body);
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error('Error processing orders:', error);
    res.status(500).json({ success: false, error: 'Error processing orders' });
  }
};

const recurringPayments = async (req, res) => {
  try {
    const payments = await createRecurringPayment(req.body);
    res.status(200).json(payments);
  } catch (error) {
    console.error('Error processing recurring payments:', error);
    res.status(500).json({ success: false, error: 'Error processing recurring payments' });
  }
};

const statusNach = async (req, res) => {
  try {
    const customerId = req.body.payload.payment.entity.customer_id;
    console.log(customerId);
    console.log(`Received status update for customer ${customerId} and year ${2024}`);
    const fetchedData = await fetchABCData(customerId, "2024");
    console.log(fetchedData);

    if (!fetchedData) {
      throw new Error(`Data not found for customer_id ${customerId} and year ${2024}`);
    }

    fetchedData.status_after_presentation = req.body.payload.payment.entity.status;
    await storeData(fetchedData);
    const success = await processNACHData(fetchedData);

    console.log('Data updated successfully.', fetchedData);
    res.status(200).send('Data updated successfully.');
  } catch (error) {
    console.error('Error processing status-nach:', error);
    res.status(500).send('Internal server error');
  }
};

const populateDynamo = (req, res) => {
  DataFromSQL();
  console.log("DATA TRANSFERRED IN THE DYNAMO DB TABLE");
  res.send("done");
};

const healthCheck = (req, res) => {
    console.log("Health Up")
  res.send('This is your NACH up here! Working Great');
};

module.exports = {
  sendJson,
  fetchData,
  fetchDataABC,
  createOrder,
  recurringPayments,
  statusNach,
  populateDynamo,
  healthCheck,
};

const AWS = require('aws-sdk');
var mysql = require('mysql');



async function storeData(NACH_data) {
  const params = {
    TableName: "nach-presentation",
    Item: NACH_data,
  };

  try {
    await docClient.put(params).promise();
    console.log('Item stored in DynamoDB');
    return true;
  } catch (error) {
    console.error('Error storing item in DynamoDB:', error);
    return false;
  }
}

async function fetchABCData(partition_key, sort_key) {
  try {
    const params = {
      TableName: "nach-presentation",
      Key: {
        customer_id: partition_key,
        year: sort_key,
      },
    };
    const data = await docClient.get(params).promise();

    if (!data.Item) {
      throw new Error(`Data not found for customer_id: ${partition_key}`);
    }

    return data.Item;
  } catch (error) {
    console.error(`Error fetching data with customer_id ${partition_key}:`, error);
    throw error;
  }
}

async function processNACHData(NACH_data) {
  try {
    const success = await storeData(NACH_data);
    return success;
  } catch (error) {
    console.error('Error storing NACH data:', error);
    throw new Error('Failed to store NACH data');
  }
}

var con = mysql.createConnection({
  host: "",
  user: "",
  password: "",
  database: ""
});

function DataFromSQL() {
  con.connect(function (err) {
    if (err) throw err;
    con.query("SELECT DISTINCT customer_id , loan_id , person_name , bank_name , account_type , debit_type , account_number , ifsc_code , amount , mobile_num , email , start_date FROM nach_master nm JOIN ENACH_Logs el ON nm.lead_id = el.lead_id WHERE customer_id IS NOT NULL LIMIT 5", function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      populateDynamoDB(result);
    });
  });
}

const dynamoDB = new AWS.DynamoDB.DocumentClient();

function populateDynamoDB(data) {
  data.forEach(item => {
    item.year = "2024";
    const params = {
      TableName: 'nach-presentation',
      Item: item,
    };

    dynamoDB.put(params, function (err, data) {
      if (err) {
        console.error("Unable to add item", item.customer_id, ". Error JSON:", JSON.stringify(err, null, 2));
      } else {
        console.log("PutItem succeeded:", item.customer_id);
      }
    });
  });
}

module.exports = {
  storeData,
  fetchABCData,
  processNACHData,
  DataFromSQL,
  populateDynamoDB,
};

// vi: sw=2 sts=2 ai
export const writeRecords = async () => {
  console.log("Writing records")
  const currentTime = Date.now().toString() // Unix time in milliseconds

  const dimensions = [
    {'Name': 'region', 'Value': 'us-east-1'},
    {'Name': 'az', 'Value': 'az1'},
    {'Name': 'hostname', 'Value': 'host1'}
  ]

  const cpuUtilization = {
    'Dimensions': dimensions,
    'MeasureName': 'cpu_utilization',
    'MeasureValue': '13.5',
    'MeasureValueType': 'DOUBLE',
    'Time': currentTime.toString()
  }

  const memoryUtilization = {
    'Dimensions': dimensions,
    'MeasureName': 'memory_utilization',
    'MeasureValue': '40',
    'MeasureValueType': 'DOUBLE',
    'Time': currentTime.toString()
  }

  const records = [cpuUtilization, memoryUtilization]

  const params = {
    DatabaseName: constants.DATABASE_NAME,
    TableName: constants.TABLE_NAME,
    Records: records
  }

  const request = writeClient.writeRecords(params)
  await request.promise().then(
    (data) => {
      console.log("Write records successful");
    },
    (err) => {
      console.log("Error writing records:", err)
      if (err.code === 'RejectedRecordsException') {
        const responsePayload = JSON.parse(request.response.httpResponse.body.toString())
        console.log("RejectedRecords: ", responsePayload.RejectedRecords)
        console.log("Other records were written successfully. ")
      }
    }
  )
}

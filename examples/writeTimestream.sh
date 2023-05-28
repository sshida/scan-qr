#!/usr/bin/env bash
# vi: sw=2 sts=2 ei

set -euo pipefail

buildRequestParamsForTimestream() {
  local macAddress="$1"
  local password="$2"
  local datetimeString=$(date +%s) # integer as UNIX Time seconds
  cat <<__EOF__
[
  {
    "Dimensions": [
      {
        "Name": "macAddress",
        "Value": "$macAddress",
        "DimensionValueType": "VARCHAR"
      }
    ],
    "MeasureName": "password",
    "MeasureValue": "$password",
    "MeasureValueType": "VARCHAR",
    "Time": "$datetimeString",
    "TimeUnit": "SECONDS"
  }
]
__EOF__
}

writeTimestreamRecord() {
  local macAddress="$1"
  local password="$2"

  local json=$(buildRequestParamsForTimestream "$macAddress" "$password")
  echo $json
  aws timestream-write write-records \
    --database-name rut240 \
    --table-name macPassword \
    --records "$json" \

}
 
macAddress="$1"
password="$2"
writeTimestreamRecord "$macAddress" "$password"

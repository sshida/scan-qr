SELECT measure_value::varchar as password
FROM "rut240".macPassword as tab
WHERE time > ago(9h)
  AND tab.macAddress = '0101010101EE'
  AND measure_name = 'password'
ORDER BY time DESC
LIMIT 1


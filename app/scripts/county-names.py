import csv
import json

out = {}

with open('../data/national_county.csv', 'r') as incsv:
  reader = csv.DictReader(incsv)
  for row in reader:
    out[row['F1'] + row['F2']] = row['NAME']

with open('../json/county-names.json', 'w') as outjson:
  json.dump(out, outjson)


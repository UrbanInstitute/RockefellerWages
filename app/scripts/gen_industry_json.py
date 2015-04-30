
import json
import csv
import sys
import re


def main(args):

  industry = re.compile(r'^(\d\d)(?:-(\d\d))?$')

  out = {"general" : [], "detail" : []}

  with open('../data/industry_titles.csv') as incsv:
    reader = csv.DictReader(incsv)
    for row in reader:
      code = industry.match(row['industry_code'])

      title = re.sub(r'^NAICS\s\d+[-\d\d]?\s', '', row['industry_title'])

      if code:
        start, end = map(lambda x : int(x) if x else x, code.groups())
        codes = list(range(start, end+1)) if end else [start]
        out['general'].append({"prefixes" : [str(x) for x in codes], "name" : title})
      else:
        out['detail'].append({"code" : row['industry_code'], "name" : title})

  with open('../json/industry_codes.json', 'w') as outjson:
    json.dump(out, outjson)


if __name__ == '__main__':
  main(sys.argv[1:])

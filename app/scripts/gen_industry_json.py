
import json
import csv
import sys
import re
import os.path


def filename(code):
  return "../data/compressed/IND_" + code + "_VAR_wage_adj.csv"


def main(args):

  industry = re.compile(r'^(\d\d)(?:-(\d\d))?$')

  out = {"general" : [], "detail" : []}

  with open('../data/industry_titles.csv') as incsv:
    reader = csv.DictReader(incsv)
    valid_prefixes = set()

    for row in reader:
      code = industry.match(row['industry_code'])

      title = re.sub(r'^NAICS\s\d+(?:-\d+)?', '', row['industry_title'])

      if code:
        start, end = map(lambda x : int(x) if x else x, code.groups())
        codes = list(range(start, end+1)) if end else [start]
        out['general'].append({"prefixes" : [str(x) for x in codes], "name" : title})
      else:
        c = row['industry_code']
        fname = filename(c)
        if len(c) <= 4 and os.path.isfile(fname):
          if len(c) == 3:
            title += " (Total)"
          valid_prefixes |= {c[:2]}
          out['detail'].append({"code" : c, "name" : title})

    out['general'] = filter(
      lambda x : any(c in valid_prefixes for c in x['prefixes']), 
      out['general']
    )

  with open('../json/industry_codes.json', 'w') as outjson:
    json.dump(out, outjson)


if __name__ == '__main__':
  main(sys.argv[1:])

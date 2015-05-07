#
# Prepare Data for BLS Labor Force Statistics Graphic
# Ben Southgate
# 9/22/14
#

import os
import csv
import json
import pandas as pd
import numpy as np

#
#
# Class to encode / decode to / from arbitrary base
#
#
class Encoder:
  def __init__( self,
                alphabet='0123456789abcdefghijklmnopq\
                          rstuvwxyzABCDEFGHIJKLMNOPQR\
                          STUVWXYZ&()*+./:;<=%?@[]^_`{|}~>'.replace(" ", '')):
    self.alphabet = alphabet

  def encode(self, num):
    if (num == 0):
      return self.alphabet[0]
    arr = []
    base = len(self.alphabet)
    while num:
      rem = num % base
      num = num // base
      arr.append(self.alphabet[rem])
    arr.reverse()
    return ''.join(arr)

  def decode(self, string):
    base = len(self.alphabet)
    strlen = len(string)
    num = 0
    idx = 0
    for char in string:
      power = (strlen - (idx + 1))
      num += self.alphabet.index(char) * (base ** power)
      idx += 1
    return num

  def compress(self, incsv, output=None, skip_rows={0},
               skip_cols=set()):
    """
      Compress file (requires all values to be integers)
    """
    read_csv = type(incsv) == str
    out = []
    if read_csv:
      reader = csv.reader(open(incsv, 'r'))
    else:
      reader = incsv
    for r, row in enumerate(reader):
      if not (r in skip_rows):
        new_row = []
        for c, cell in enumerate(row):
          if not (c in skip_cols):
            new_row.append(self.encode(int(cell)))
          else:
            new_row.append(cell)
        out.append(new_row)
      else:
        out.append(row)
    if output == None and read_csv:
      output = incsv.replace('.csv', '.min.csv')
    elif output != None:
      pass
    else:
      raise Exception("Output filename required...")
    with open(output, 'w') as output_file:
      output_file.write(
        "\n".join([",".join([str(c) for c in row]) for row in out])
      )


#
#
# Compress an individual raw data file
#
#
def compressFile(path, filename, encoder):
  print("Compressing {}...".format(filename))
  
  variables = ('wage_adj', 'pop_pct')

  full_df = pd.read_csv(path + '/' + filename, dtype=object)

  if all(not np.isfinite(full_df[v].apply(float)).any() for v in variables):
     return None

  full_df = full_df[full_df['area_fips'].apply(lambda x: not (str(x)[2:] == "999") )]
  full_df = full_df[full_df['year'] >= 2000]
  full_df['time'] = (full_df['year'].apply(int) - 1990)*4 + full_df['qtr'].apply(int)
  full_df['id'] = full_df['area_fips'].apply(lambda x: x.replace("US", ""))

  industry = full_df['industry_code'].tolist()[0]

  for variable in variables:
    df = full_df[['time', 'id', variable]]
    df[variable] = df[variable].apply(float)

    # drop missing values
    df = df[np.isfinite(df[variable])]
    
    # multiply the percentage by 1000 to store as int
    if variable == 'pop_pct':
      df[variable] = df[variable]*1000

    # convert variable to int for compression 
    df[variable] = df[variable].apply(int)

    df = df.pivot(index='id', columns='time', values=variable).fillna(0)
    
    matrix = [['id'] + list(df.columns)] + list(df.itertuples())
    
    encoder.compress(
      matrix, 
      output="{}/IND_{}_VAR_{}.csv".format(
        path.replace('raw', 'compressed'),
        industry,
        variable
      )
    )


#
#
# Convert raw data directory to compressed csvs
#
#
def compressDirectory(path):
  encoder = Encoder()
  for filename in os.listdir(path):
    s = filename
    compressFile(path, filename, encoder)


if __name__ == "__main__":
  compressDirectory("../data/raw")
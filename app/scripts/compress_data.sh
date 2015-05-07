#!/usr/bin/env sh

# encode csvs into base 86
python encode.py

# generate industry json file for vizualization
python gen_industry_json.py

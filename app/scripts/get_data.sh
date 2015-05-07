#!/usr/bin/env sh

BACHUS_DATA=http://datatools.urban.org/features/bsouthga/rfdata/data.tar.gz
echo downloading data from $BACHUS_DATA
curl --progress $BACHUS_DATA > ./data.tar.gz
tar -xzf data.tar.gz
## Visualizing wages and labor force patterns

### Installing and Building the project

First clone the repo and install dependencies
```shell
git clone https://github.com/UI-Research/RockefellerWages.git
cd RockefellerWages/
npm install
sudo npm install -g grunt-cli
sudo npm install -g bower
bower install
```

Get the current data from bacchus (a zipped tar file)
```shell
BACHUS_DATA=http://datatools.urban.org/features/bsouthga/rfdata/data.tar.gz
curl --progress $BACHUS_DATA > ./data.tar.gz
tar -xzf data.tar.gz
```

Next, `grunt` to start a watch server
```shell
grunt
```

### Minifying code and deploying to Bacchus

Once the code is in a state you feel is good for production, run the following command:
```shell
grunt deploy
```
This will minify all the javascript and css and copy over the code to bacchus (currently the folder `/bsouthga/rfdata/`). If you wish to change the deployment folder, edit the path at the top of `Gruntfile.js`.

### Updating the data

In order to be able to serve the large amount of data to the browser, the data must be compressed using a python script (`encode.py`). Additioanlly, once the new data is encoded, a json file containing the list of acceptable industry codes must be generated. This can be done by running the python file `gen_industry_json.py`. In full, the steps to generate the new data are...

- Copy the "raw" data into `app/data/raw/`
- cd to `scripts`
- run `python encode.py`
- run `python gen_industry_json.py`
- run `sh deploy_data.sh $DEPLOY_PATH` (where  $DEPLOY_PATH is the root folder of the project on bacchus)


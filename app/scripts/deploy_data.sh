#!/usr/bin/env sh

DEPLOY_PATH=$1
TAR=data.tar.gz

echo deploying data to $DEPLOY_PATH

cd ../
echo creating tarball...
tar czfP ../$TAR ./data/
echo copying tarball...
mv ../$TAR $DEPLOY_PATH

cd $DEPLOY_PATH
echo unzipping tarball...
tar -xzf $TAR
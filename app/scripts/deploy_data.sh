#!/usr/bin/env sh

DEPLOY_PATH=$1
TAR=data.tar.gz

echo deploying data to $DEPLOY_PATH

cd ../
echo creating tarball, this will take a long while...
tar czfP ../$TAR ./data/ --exclude=./data/raw/*
echo copying tarball...
rm -f $DEPLOY_PATH/$TAR
mv ../$TAR $DEPLOY_PATH

cd $DEPLOY_PATH
echo unzipping tarball...
tar -xzf $TAR 
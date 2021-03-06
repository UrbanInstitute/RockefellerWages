#!/usr/bin/env sh


DEPLOY_PATH=$1
TAR=dist.tar.gz

echo deploying production code to $DEPLOY_PATH

cd ../../dist/
echo creating tarball...
tar czfP ../$TAR ./
echo copying tarball...
mv ../$TAR $DEPLOY_PATH

cd $DEPLOY_PATH
echo unzipping tarball...
tar -xzf $TAR
rm $TAR

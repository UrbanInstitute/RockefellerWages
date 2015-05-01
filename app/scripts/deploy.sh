#!/usr/bin/env sh


DEPLOY_PATH=B:/bsouthga/rfdata
TAR=dist.tar.gz

cd ../../dist/
echo creating tarball...
tar czfP ../$TAR ./
echo copying tarball...
mv ../$TAR $DEPLOY_PATH

cd $DEPLOY_PATH
echo unzipping tarball...
tar -xzf $TAR
rm $TAR

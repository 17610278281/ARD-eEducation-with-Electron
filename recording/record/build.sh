if [ ! -e AgoraCoreService ];
then
  echo "AgoraCoreService not found"
  exit 1
fi

cd src
node-gyp clean
node-gyp configure
node-gyp build
cp build/Release/agorasdk.node ../.

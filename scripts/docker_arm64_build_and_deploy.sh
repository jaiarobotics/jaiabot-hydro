#!/bin/bash

set -e

script_dir=$(dirname $0)

cd ${script_dir}/..
mkdir -p build

if [ "$(docker image ls build_system --format='true')" != "true" ];
then
    echo "🟢 Building the docker build_system image"
    docker build -t build_system .docker/focal/arm64
fi

echo "🟢 Building jaiabot apps"
docker run -v `pwd`:/home/ubuntu/jaiabot -w /home/ubuntu/jaiabot -t build_system bash -c "./scripts/arm64_build.sh"

# Send the files to target machine

if [ -z "$1" ]
    then
        echo "             -----------"
        echo "Not Deploying as you didn't specify any targets"
    else
        for var in "$@"
	    do
    		echo "🟢 Uploading to "$var
		    rsync -aP --delete --force --relative ./build/bin ./build/lib ./config ./scripts ./src/arduino ubuntu@"$var":/home/ubuntu/jaiabot/
	    done
fi


#!/bin/bash
set -e # fail on error

# Get the number of CPUS on the system
NCPUS=$(lscpu|grep '^CPU.s.:'|awk '{print $2}')

# Divide that number by two, use that number to build
# Add one to make sure we don't get zero.
BCPUS=$((1+$NCPUS/2))

mkdir -p /phylanx/build
cd /phylanx/build

# Configure
cmake -DPHYLANX_WITH_TOOLS=On -DHPX_DIR=/usr/local/lib/cmake/HPX -Dblaze_DIR=/blaze/share/blaze/cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_C_COMPILER=clang -DPHYLANX_WITH_HIGHFIVE=On ..

# Build
make -j$BCPUS install

# Cleanup
rm -fr /phylanx/build

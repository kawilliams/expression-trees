FROM stellargroup/phylanx_base:prerequisites
RUN apt-get update
RUN apt-get install -y jupyter-notebook vim
RUN git config --global user.email "sbrandt@cct.lsu.edu"
RUN git config --global user.name "Steven R. Brandt"
RUN git clone https://github.com/kawilliams/expression-trees.git
RUN git clone --depth 1 https://github.com/stellar-group/phylanx.git 
WORKDIR /phylanx
WORKDIR /phylanx/build
RUN cmake -DPHYLANX_WITH_TOOLS=On -DHPX_DIR=/usr/local/lib/cmake/HPX -Dblaze_DIR=/blaze/share/blaze/cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_CXX_COMPILER=clang++ -DCMAKE_C_COMPILER=clang -DPHYLANX_WITH_HIGHFIVE=On ..
RUN make -j10 install

EXPOSE 8789

WORKDIR /expression-trees/notebook
COPY Dockerfile /Dockerfile

CMD jupyter-notebook --ip 0.0.0.0 --port 8789 --no-browser --allow-root

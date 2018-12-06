FROM stellargroup/phylanx_base:prerequisites
RUN apt-get update && apt-get install -y jupyter-notebook vim && apt-get purge
RUN git config --global user.email "sbrandt@cct.lsu.edu"
RUN git config --global user.name "Steven R. Brandt"
RUN git clone --depth 1 https://github.com/kawilliams/expression-trees.git
RUN git clone --depth 1 https://github.com/stellar-group/phylanx.git 
WORKDIR /phylanx
COPY compile.sh compile.sh
RUN bash compile.sh

EXPOSE 8789

WORKDIR /expression-trees/notebook
COPY Dockerfile /Dockerfile

CMD jupyter-notebook --ip 0.0.0.0 --port 8789 --no-browser --allow-root

FROM stevenrbrandt/phylanx.test:working
USER root
RUN dnf install -y vim 
RUN pip3 install jupyter
USER jovyan
RUN git config --global user.email "sbrandt@cct.lsu.edu"
RUN git config --global user.name "Steven R. Brandt"
RUN git clone --depth 1 https://github.com/kawilliams/expression-trees.git

EXPOSE 8789

WORKDIR /home/jovyan/expression-trees/notebook
COPY Dockerfile /Dockerfile
COPY start.sh start.sh

CMD bash ./start.sh

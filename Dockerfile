FROM praekeltfoundation/vxsandbox
MAINTAINER Praekelt Foundation <dev@praekeltfoundation.org>

# Install nodejs dependencies
COPY package.json /app/package.json
WORKDIR /app
RUN apt-get-install.sh npm && \
    npm install --production && \
    apt-get-purge.sh npm

# Copy in the app Javascript
COPY go-*.js /app/

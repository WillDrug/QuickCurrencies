FROM node:12.0.0-alpine

ENV ENV_NAME dev
ENV NODE_ENV dev
ENV NODE_CONFIG_ENV dev

# Create Directory for the Container
WORKDIR /usr/src/app

# Only copy the package.json file to work directory
COPY package.json script.js tsconfig.json ./

# Install all Packages
RUN yarn install

# Copy all other source code to work directory
COPY src ./src

# Start
CMD [ "yarn", "start" ]
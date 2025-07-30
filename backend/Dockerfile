FROM node:20-alpine
LABEL maintainer="tyndorael"
# Set the working directory
WORKDIR /app
# Install dependencies
# Copy package.json and package-lock.json
# to leverage Docker cache
COPY package*.json ./
# Install dependencies
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000
EXPOSE 9229

CMD ["npm", "run", "start:debug"]
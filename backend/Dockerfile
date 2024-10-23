# Use an official Node runtime as a parent image
FROM node:14-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install any needed packages specified in package.json
RUN npm install

# Bundle the app source inside the Docker container
COPY . .

# Make port 3001 available outside this container
EXPOSE 3001

# Run the app when the container launches
CMD ["node", "index.js"]

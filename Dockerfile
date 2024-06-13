# Use an official Node.js runtime as a parent image
FROM node:20

# Copy needed files
COPY package.json .
COPY package-lock.json .
COPY dist dist

RUN npm ci --only=production

ENV NOTION_API_URL=https://api.notion.com/v1/
ENV API_URL

# Run the application
ENTRYPOINT ["node", "out"]

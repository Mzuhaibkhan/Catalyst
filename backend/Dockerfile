FROM node:20-alpine
WORKDIR /app/backend

COPY package*.json ./
RUN npm install

COPY . ./

# Ensure parent dataset files are copied if present
COPY ../candidates.json ../candidates.json
COPY ../curriculum.json ../curriculum.json

RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]

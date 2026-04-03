FROM node:20-alpine

WORKDIR /app

# Install backend deps
COPY package*.json ./
RUN npm install

# Copy project
COPY . .

# 🔥 Install frontend deps separately
WORKDIR /app/web
RUN npm install

# 🔥 Build frontend
RUN npm run build

# Back to root
WORKDIR /app

# Build CLI
RUN npm run build

# Install CLI globally
RUN npm install -g .

EXPOSE 3000

CMD ["cloakx", "web"]
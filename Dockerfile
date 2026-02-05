# Use official Playwright image (browsers + deps already installed)
FROM mcr.microsoft.com/playwright:v1.58.1-jammy

# Work directory inside container
WORKDIR /app

# Copy package files first
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy project files
COPY . .

# Run tests + generate HTML report
CMD ["npx", "playwright", "test", "--reporter=html"]

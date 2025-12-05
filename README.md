<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Bubble Couple Game

This is a fun bubble couple game built with React, TypeScript, and Vite.

View your app in AI Studio: https://ai.studio/apps/drive/1Fqc9uDMOooISdVLuRvGoX8bi_MGlbFgm

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key (if needed)

3. Run the app:
   ```bash
   npm run dev
   ```

## Deploy with Docker

**Prerequisites:** Docker and Docker Compose

### Option 1: Using Docker
```bash
# Build the image
docker build -t bubble-couple .

# Run the container
docker run -p 3000:80 bubble-couple
```

### Option 2: Using Docker Compose
```bash
# Start the application
docker-compose up -d

# Stop the application
docker-compose down
```

The application will be available at `http://localhost:3000`

## Deploy to Dokploy

This project is ready for deployment on Dokploy platform. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Start:**
1. Create a new application in Dokploy
2. Connect your GitHub repository
3. Select Dockerfile build method
4. Deploy!

For detailed Chinese/English deployment guide, check [DEPLOYMENT.md](./DEPLOYMENT.md) (包含中文部署说明).

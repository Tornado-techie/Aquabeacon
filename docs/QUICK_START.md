# Quick Start Guide for AquaBeacon

This guide provides the essential commands to get the AquaBeacon full-stack MERN application running from scratch. For more detailed setup instructions and explanations, please refer to the main `README.md` file.

## 1. Clone the Repository (if you haven't already)

```bash
git clone <repository_url>
cd aquabeacon
```

## 2. Environment Variables

Create `.env` files in both the `server/` and `client/` directories.

### `server/.env`

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/aquabeacon
JWT_SECRET=your_jwt_secret_key
```

### `client/.env`

```
VITE_API_URL=http://localhost:5000/api
```

## 3. Start MongoDB (using Docker Compose - Recommended)

```bash
cd infra
docker-compose up -d
cd .. # Return to the project root
```

## 4. Backend Setup and Start (`server/`)

```bash
cd server
npm install
npm start
```

## 5. Frontend Setup and Start (`client/`)

```bash
cd client
npm install
npm run dev
```

## 6. Access the Application

Once both the backend and frontend servers are running, open your web browser and navigate to:

```
http://localhost:5173
```

(Note: The frontend port might vary if not 5173. Check your terminal output when running `npm run dev`.)

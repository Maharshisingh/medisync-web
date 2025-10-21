# MediSync - Medicine Finder Web Application

A comprehensive medicine finder platform connecting users with local pharmacies.

## Features

- **User Authentication**: Secure login/register for users and pharmacies
- **Medicine Search**: Find medicines across multiple pharmacies
- **Pharmacy Partner Portal**: Inventory management for pharmacy partners
- **Admin Dashboard**: Approve/reject pharmacy applications
- **Forgot Password**: Password reset for both users and pharmacies
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT tokens
- **Deployment**: Render

## Deployment on Render

### Prerequisites
1. GitHub repository with your code
2. Render account

### Steps
1. **Connect Repository**: Link your GitHub repo to Render
2. **Environment Variables**: Set in Render dashboard:
   - `NODE_ENV=production`
   - `MONGODB_URI=your_mongodb_connection_string`
   - `JWT_SECRET=your_jwt_secret`
   - `FRONTEND_URL=https://your-app.onrender.com`

3. **Build Settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`

### Local Development

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Build for production
npm run build
```

## Project Structure

```
medisync-project/
├── medisync-backend/          # Node.js API server
├── medisync-frontend/         # React frontend
├── package.json              # Root package.json for deployment
├── render.yaml               # Render configuration
└── README.md                 # This file
```

## API Endpoints

### Authentication
- `POST /api/auth/register/user` - User registration
- `POST /api/auth/login/user` - User login
- `POST /api/auth/register/pharmacy` - Pharmacy registration
- `POST /api/auth/login/pharmacy` - Pharmacy login
- `POST /api/auth/forgot-password/user` - User forgot password
- `POST /api/auth/reset-password/user` - User reset password
- `POST /api/auth/forgot-password/pharmacy` - Pharmacy forgot password
- `POST /api/auth/reset-password/pharmacy` - Pharmacy reset password

### Admin
- `GET /api/admin/pharmacies/pending` - Get pending pharmacy approvals
- `PUT /api/admin/pharmacies/approve/:id` - Approve pharmacy
- `DELETE /api/admin/pharmacies/reject/:id` - Reject pharmacy

### Pharmacies
- `GET /api/pharmacies/search` - Search medicines across pharmacies
- `GET /api/pharmacies/inventory` - Get pharmacy inventory
- `POST /api/pharmacies/inventory` - Add medicine to inventory
- `PUT /api/pharmacies/inventory/:id` - Update inventory item
- `DELETE /api/pharmacies/inventory/:id` - Delete inventory item

## License

MIT License
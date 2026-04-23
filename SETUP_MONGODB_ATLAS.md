# MongoDB Atlas Setup - 2 Minutes

Since local MongoDB isn't installed, let's use MongoDB Atlas (free cloud database).

## Quick Setup Steps

### 1. Create Free MongoDB Atlas Account

Go to: https://www.mongodb.com/cloud/atlas/register

- Sign up with your email: gauravkhandelwal205@gmail.com
- Choose "Free" tier (M0)

### 2. Create a Cluster

- Click "Build a Database"
- Select "FREE" (M0 Sandbox)
- Choose a cloud provider (AWS recommended)
- Choose a region close to you
- Click "Create Cluster" (takes 1-3 minutes)

### 3. Create Database User

- Click "Database Access" in left sidebar
- Click "Add New Database User"
- Username: `sahara-admin`
- Password: Click "Autogenerate Secure Password" and COPY it
- Database User Privileges: "Read and write to any database"
- Click "Add User"

### 4. Allow Network Access

- Click "Network Access" in left sidebar
- Click "Add IP Address"
- Click "Allow Access from Anywhere" (for development)
- Click "Confirm"

### 5. Get Connection String

- Click "Database" in left sidebar
- Click "Connect" on your cluster
- Click "Connect your application"
- Copy the connection string (looks like):
  ```
  mongodb+srv://sahara-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```

### 6. Update Your .env File

Replace `<password>` with the password you copied in step 3:

```bash
cd Sahara/backend
```

Edit `.env` file and update MONGODB_URI:
```
MONGODB_URI=mongodb+srv://sahara-admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/sahara-db?retryWrites=true&w=majority
```

**Important**: Replace `YOUR_PASSWORD_HERE` with your actual password!

### 7. Start Backend

```bash
npm run dev
```

## Done!

Your backend should now connect to MongoDB Atlas successfully.

## Alternative: Use the Script

I can also create a script that uses MongoDB Atlas connection string directly. Just provide me with your MongoDB Atlas connection string.

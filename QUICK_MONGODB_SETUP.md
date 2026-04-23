# Quick MongoDB Atlas Setup (5 Minutes)

## Step 1: Sign Up (1 minute)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google or email
3. Skip the survey questions

## Step 2: Create Free Cluster (1 minute)
1. Click "Build a Database"
2. Choose **"M0 FREE"** (left option)
3. Provider: AWS
4. Region: Choose closest to you (e.g., Mumbai for India)
5. Cluster Name: Keep default or name it "Sahara"
6. Click **"Create"** (takes 3-5 minutes to provision)

## Step 3: Create Database User (1 minute)
While cluster is creating:
1. You'll see "Security Quickstart"
2. **Username:** `sahara_user`
3. **Password:** Click "Autogenerate Secure Password"
4. **COPY THE PASSWORD** (you'll need it!)
5. Click "Create User"

## Step 4: Whitelist IP (30 seconds)
1. Click "Add My Current IP Address"
2. Or click "Allow Access from Anywhere" (for development)
3. Click "Finish and Close"

## Step 5: Get Connection String (1 minute)
1. Click "Connect" on your cluster
2. Click "Drivers"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://sahara_user:<password>@cluster0.xxxxx.mongodb.net/
   ```
4. Replace `<password>` with the password you copied
5. Add `sahara-db` at the end:
   ```
   mongodb+srv://sahara_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sahara-db
   ```

## Step 6: Update .env File (30 seconds)

Open `Sahara/backend/.env` and update the MONGODB_URI line:

```env
PORT=5000
MONGODB_URI=mongodb+srv://sahara_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/sahara-db
JWT_SECRET=ijustwanttodienononoidontwanttodie
FRONTEND_URL=http://localhost:3000
EMAIL_USER=gauravkhandelwal205@gmail.com
EMAIL_PASS=rltjafejhkeotlri
```

## Step 7: Start Backend

```bash
cd Sahara/backend
npm run dev
```

You should see:
```
[INFO] MongoDB connected successfully
[INFO] Server is running on http://localhost:5000
```

## ✅ Done!

Your backend is now connected to MongoDB Atlas (cloud database).

---

## Example Connection String

If your cluster is `cluster0.abc123.mongodb.net` and password is `MyPass123`:

```
MONGODB_URI=mongodb+srv://sahara_user:MyPass123@cluster0.abc123.mongodb.net/sahara-db
```

**Important:** 
- No spaces in the connection string
- Replace `<password>` with actual password
- Keep `/sahara-db` at the end


# 🎓 InstaEduPay – Backend API

A robust **NestJS-based REST API** that powers the School Payment and Dashboard Application. This backend handles **order creation**, **transaction management**, **payment gateway integration**, and **webhook processing**, all secured with **JWT authentication** and optimized with **MongoDB Aggregation Pipelines**.

---

## 🚀 Live API & Repo Links

- 🔗 **Live API**: [https://your-backend-host-url.com ](https://instaedupay.onrender.com)
- 📂 **GitHub Repo**: https://github.com/ayushhhh13/insta-edu-pay-backend

---

## 🎯 Objective

To build a **microservice architecture** backend that allows secure and scalable management of school payment transactions, supporting payment gateway interactions, webhook updates, and robust reporting capabilities.

---

## ⚙️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) (Node.js + TypeScript)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Authentication**: JWT-based auth with `@nestjs/jwt`
- **Validation**: `class-validator`, `class-transformer`
- **HTTP Client**: Axios
- **API Docs**: Swagger
- **Hosting**: [Render](#)

---

## 🏗️ Project Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/insta-edu-pay-backend.git
cd insta-edu-pay-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit the .env file with your own credentials

# 4. Start the server
npm run start:dev
```

## 🧩 MongoDB Schemas
1. Order Schema
{
  _id: ObjectId,
  school_id: ObjectId | string,
  trustee_id: ObjectId | string,
  student_info: {
    name: string,
    id: string,
    email: string
  },
  gateway_name: string
}

2. Order Status Schema
   {
  collect_id: ObjectId (ref: Order),
  order_amount: number,
  transaction_amount: number,
  payment_mode: string,
  payment_details: string,
  bank_reference: string,
  payment_message: string,
  status: string,
  error_message: string,
  payment_time: Date
}

3. Webhook Logs Schema
  {
    order_id: string,
    payload: Object,
    received_at: Date
   }
   
## 🔁 Payment Flow
🔸 POST /create-payment
Accepts payment details from client
Forwards data to Create Collect Request API
JWT signs the payload for secure redirection
Returns a redirect_url from payment gateway
{
  "school_id": "65b0e6293e9f76a9694d84b4",
  "student_info": {
    "name": "Ayush Agrawal",
    "id": "STU1001",
    "email": "ayushagrawal1330@gmail.com"
  },
  "order_amount": 2000
}


## 🌐 Webhook Integration
🔸 POST /webhook
Updates Order Status when payment confirmation is received
Matches order_id (collect_id) and updates corresponding status
{
  "status": 200,
  "order_info": {
    "order_id": "6630f1b29b6bd36f9e5f2098",
    "order_amount": 2000,
    "transaction_amount": 2200,
    "gateway": "PhonePe",
    "bank_reference": "YESBNK222",
    "status": "success",
    "payment_mode": "upi",
    "payemnt_details": "success@ybl",
    "Payment_message": "payment success",
    "payment_time": "2025-04-23T08:14:21.945+00:00",
    "error_message": "NA"
  }
}

Screenshots of MongoDB:
Order Schema:
<img width="1470" alt="Screenshot 2025-04-30 at 4 56 05 PM" src="https://github.com/user-attachments/assets/d238544d-0983-4184-961a-79a5ef7d7197" />

OrderStatuses Schema: 
<img width="1456" alt="Screenshot 2025-04-30 at 4 56 43 PM" src="https://github.com/user-attachments/assets/248dc832-ca21-495a-a770-c3e8fffcc5fc" />

Users Table:
<img width="1470" alt="Screenshot 2025-04-30 at 4 58 04 PM" src="https://github.com/user-attachments/assets/159fad32-b171-417a-a9cb-1b3ef8b2bd57" />

Webhooklogs Table:
<img width="1470" alt="Screenshot 2025-04-30 at 4 58 23 PM" src="https://github.com/user-attachments/assets/6216168d-bf22-472a-8b82-54f8a23b5358" />


## 📄 API Endpoints

🔐 Authentication
POST /auth/register – Create new user
POST /auth/login – JWT login

📋 Transactions
Method | Endpoint | Description
GET -> /transactions ->  Get all transactions (aggregated view)
GET -> /transactions/school/:schoolId  -> Get all transactions for a specific school
GET -> /transaction-status/:custom_order_id ->  Check status for a given transaction
POST -> /create-payment -> Initiates payment and redirects to payment gateway
POST -> /webhook -> Webhook listener from payment provider

## 📦 Query Features
✅ Pagination: ?limit=10&page=2
✅ Sorting: ?sort=payment_time&order=desc
✅ Filtering: (by status, school_id, etc.)

### 🛡️ Security
All routes are protected using JWT authentication
Input validation using class-validator
CORS & Helmet for production security
Webhook logs and error tracking

### 🧪 Testing
Used Postmanc lient to test:

## 🧪 Postman API Testing Screenshots
# POST-> /auth/register
<img width="835" alt="Screenshot 2025-04-30 at 4 39 19 PM" src="https://github.com/user-attachments/assets/3eceb0c5-47a1-4249-b1d1-0d326099135e" />

# GET-> /auth/login
<img width="803" alt="Screenshot 2025-04-30 at 4 42 00 PM" src="https://github.com/user-attachments/assets/0423d6ed-5477-4352-b4f9-72405c2638db" />

# GET-> /users
<img width="822" alt="Screenshot 2025-04-30 at 4 42 58 PM" src="https://github.com/user-attachments/assets/ca442857-9ea3-4412-af4e-5db81a226a85" />

# GET-> users/_id
<img width="861" alt="Screenshot 2025-04-30 at 4 43 48 PM" src="https://github.com/user-attachments/assets/d1bf594c-48a1-49cb-8441-668044e42932" />

# POST-> /orders
<img width="868" alt="Screenshot 2025-04-30 at 4 44 46 PM" src="https://github.com/user-attachments/assets/140e5eca-3042-4582-b359-d92c379993d6" />

### ✅ Create Payment API
<img width="865" alt="Screenshot 2025-04-30 at 4 45 38 PM" src="https://github.com/user-attachments/assets/3855ae0d-c74c-4c15-86b1-b155019a2595" />
<img width="826" alt="Screenshot 2025-04-30 at 4 46 11 PM" src="https://github.com/user-attachments/assets/ca7ad0b1-d7e3-41c8-8d84-52d91f85bc49" />

# GET -> payment-status/collect_request_id?school_id=65b0e6293e9f76a9694d84b4
<img width="847" alt="Screenshot 2025-04-30 at 4 47 44 PM" src="https://github.com/user-attachments/assets/788255b9-76ae-4496-be2d-e5b6f025c41a" />

# POST -> auth/generate-sign
<img width="836" alt="Screenshot 2025-04-30 at 4 46 36 PM" src="https://github.com/user-attachments/assets/08db7f1d-d213-4e1d-9401-98e28413118b" />

## ✅ Webhook Call
<img width="827" alt="Screenshot 2025-04-30 at 4 47 14 PM" src="https://github.com/user-attachments/assets/fe71a29c-dd62-40bf-a87c-2898ba1f636c" />

### ✅ Fetch Transactions
<img width="858" alt="Screenshot 2025-04-30 at 4 48 34 PM" src="https://github.com/user-attachments/assets/81d06978-7278-4df8-8072-16c1f9a44e1a" />


# GET-> transactions/school/school_id
<img width="863" alt="Screenshot 2025-04-30 at 4 49 57 PM" src="https://github.com/user-attachments/assets/55deeb38-9ae8-4e7a-8183-663dc764d735" />


# GET->  transactions/custom_order_id
<img width="862" alt="Screenshot 2025-04-30 at 4 50 57 PM" src="https://github.com/user-attachments/assets/557cceb3-3b0a-40e0-bc21-97e7898357c3" />


### 📊 Indexing Strategy
To improve query performance:
Index on school_id
Index on collect_id
Index on custom_order_id
Index on payment_time

### 🧠 Best Practices Followed
- ✅ Scalable modular structure
- ✅ DTOs and input validation
- ✅ Config-based env management
- ✅ Microservice and controller-service-repo pattern
- ✅ MongoDB Aggregation for data joining

### 📬 Submission Links
- ✅ Hosted App: https://instaedupay.onrender.com
- ✅ GitHub Repo: [https://github.com/your-username/insta-edu-pay](https://github.com/ayushhhh13/InstaEduPay)

### 📜 License
This project is licensed under the MIT License.


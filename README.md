# TinyLink - URL Shortener 🔗

A minimal, production-ready URL shortener built with **Next.js 16**, **PostgreSQL (Neon)**, and **Prisma ORM**.  
Built as part of a take-home assignment.

## 🚀 Live Demo
**Your Vercel URL:**  
`https://your-vercel-domain.vercel.app`

---

# ✨ Features

### ✅ Core Features
- Shorten long URLs  
- Custom short codes  
- Duplicate code protection  
- Redirect with HTTP 302  
- Click tracking  
- Last clicked timestamp  
- Delete links  
- Stats page `/code/:code`  
- Health check `/healthz`

### 🎨 UI Features
- Clean dashboard UI  
- Add URL form  
- Inline validation  
- Error + loading states  
- Responsive design  
- Copy buttons  
- Table with clicks + timestamps  

---

# 🗂️ Folder Structure

```
app/
 ├── api/
 │    └── links/
 │          ├── route.ts          (POST / GET)
 │          └── [code]/route.ts   (GET stats + DELETE)
 ├── code/[code]/page.tsx          (Stats page)
 ├── page.tsx                       (Dashboard)
 ├── healthz/route.ts               (Health check)
 ├── not-found.tsx
lib/
 └── prisma.ts
prisma/
 └── schema.prisma
```

---

# 🔌 API Documentation

## ➤ Create Link  
`POST /api/links`

**Body (form-data):**
```txt
url: https://google.com
code: optional
```

**Responses**
- `201 Created`  
- `409 Conflict` if code exists  
- `400 Bad Request` invalid url  

---

## ➤ List All Links  
`GET /api/links`

---

## ➤ Get Stats for One Code  
`GET /api/links/:code`

---

## ➤ Delete a Link  
`DELETE /api/links/:code`

---

## ➤ Redirect  
`GET /:code` → 302 redirect + click count increment.

---

## ➤ Health Check  
`GET /healthz`

Returns:

```json
{ "ok": true, "version": "1.0" }
```

---

# 🧪 How to Run Locally

### 1. Install dependencies
```sh
npm install
```

### 2. Create a `.env` file
Use the `.env.example` provided.

### 3. Push Prisma schema
```sh
npx prisma migrate deploy
```

### 4. Start dev server
```sh
npm run dev
```

---

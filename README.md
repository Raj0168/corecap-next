# Corecap — An EdTech Platform

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/)
[![PayU](https://img.shields.io/badge/PayU-6DB33F?style=for-the-badge&logoColor=white)](https://payu.in/)

---

## Overview

**Corecap** is an EdTech platform built with the **T3 stack** — combining **Next.js**, **Tailwind CSS**, and **TypeScript** — along with modern cloud and payment technologies.  
It provides a full-featured solution for creating, managing, and selling online courses with secure authentication, payments, and efficient content delivery.

---

## Features

### Authentication & User Management
- Secure **JWT-based** authentication system.
- **OTP verification** for user identity.
- **Google OAuth** for seamless sign-in.

### Course & Chapter Management
- Admins can create and manage structured courses and chapters.
- Each chapter is stored as a **secure PDF in Google Cloud Storage (GCS)**.

### Payments
- Integrated with **PayU** for fast and reliable course purchases.
- Includes a **server-side verification flow** to ensure transaction integrity.

### On-Demand PDF Access
- Users can view or download course chapters as PDFs.
- PDFs are served efficiently and securely from **GCS**.

### Performance & Scalability
- Deployed on **Vercel** with a **global CDN** for low-latency delivery.
- Optimized architecture designed for **horizontal scalability** and smooth growth.

---

## Technology Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

### Backend
- **Runtime**: Next.js API Routes (Full-stack)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Authentication**: JWT + [Google OAuth](https://developers.google.com/identity)
- **Payments**: [PayU](https://payu.in/)
- **Email/Notifications**: [Nodemailer](https://nodemailer.com/about/) via Google SMTP

### Storage & Hosting
- **Hosting**: [Vercel](https://vercel.com/)
- **CDN**: Vercel’s built-in global CDN
- **File Storage**: [Google Cloud Storage (GCS)](https://cloud.google.com/storage) for PDFs and static assets

---

## Architecture

Frontend (Next.js + Tailwind + TypeScript)
↓
API Routes (JWT, PayU, GCS)
↓
Database (MongoDB Atlas)
↓
Storage (Google Cloud Storage)
↓
Hosting & CDN (Vercel)

---

## License

This project is licensed under the **MIT License** — feel free to use and modify it as needed.

---

## Author

**Corecap** — Built with Next.js, TypeScript, and modern web technologies.

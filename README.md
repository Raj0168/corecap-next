# Corecap - an EdTech Platform

An MVP dtech platform built with the **T3 stack** (Next.js, Tailwind CSS, TypeScript) and other modern technologies. This application provides a full-fledged solution for creating, managing, and selling online courses.

## Features

- **Authentication & User Management**: Secure user registration, login, and profile management using JWT (JSON Web Tokens), with OTP (One-Time Password) verification and optional Google OAuth.
- **Course & Chapter Management**: Admins can create and edit rich course content using **CKEditor 5**, including text and images, which are saved to **MongoDB** and a dedicated CDN.
- **Payments**: Seamless course purchases via **PayU**, with a server-side payment verification flow.
- **On-Demand PDF Generation**: Users can download course chapters as PDFs, generated dynamically on the server using **Puppeteer**.
- **Performance & Scalability**: Deployed on **Vercel** with a global CDN for fast content delivery. The stack is designed for low latency and future scalability.

## Technology Stack

- **Frontend**:

  - **Framework**: Next.js
  - **Styling**: Tailwind CSS
  - **Language**: TypeScript

- **Backend**:

  - **Framework**: Next.js API Routes (full-stack)
  - **Database**: MongoDB Atlas (NoSQL)
  - **Authentication**: JWT, NextAuth.js (for Google OAuth)
  - **Payments**: Razorpay
  - **PDF Generation**: Puppeteer
  - **Email/Notifications**: Nodemailer (via Gmail SMTP)

- **Storage & Hosting**:

  - **Hosting**: Vercel
  - **CDN**: Vercel's built-in CDN
  - **Image/Asset Storage**: CDN-backed storage

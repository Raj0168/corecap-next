# Corecap - an EdTech Platform

An MVP (Minimum Viable Product) edtech platform built with the **T3 stack** (Next.js, Tailwind CSS, TypeScript) and other modern technologies. This application provides a full-fledged solution for creating, managing, and selling online courses.

## Features

- **Authentication & User Management**: Secure user registration, login, and profile management using JWT (JSON Web Tokens), with OTP (One-Time Password) verification and optional Google OAuth.
- **Course & Chapter Management**: Admins can create and edit rich course content using **CKEditor 5**, including text and images, which are saved to **MongoDB** and a dedicated CDN.
- **Payments**: Seamless course purchases via **Razorpay**, with a server-side payment verification flow.
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
  - **Image/Asset Storage**: CDN-backed storage (e.g., Supabase Storage, Cloudflare R2)

## Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Steps

1.  **Clone the repository**:

    ```bash
    git clone [your-repo-url]
    cd [your-repo-name]
    ```

2.  **Install dependencies**:

    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables**:
    Create a `.env.local` file in the root directory and add your credentials.

    ```env
    # MongoDB Atlas
    MONGODB_URI=your_mongodb_connection_string

    # JWT
    JWT_SECRET=your_jwt_secret

    # Gmail SMTP (Nodemailer)
    GMAIL_USER=your_gmail_email
    GMAIL_PASS=your_gmail_app_password

    # CDN for images (e.g., Supabase, Cloudflare R2)
    CDN_URL=your_cdn_base_url
    ```

4.  **Run the development server**:

    ```bash
    npm run dev
    # or
    yarn dev
    ```

5.  Open your browser and navigate to `http://localhost:3000`.

## License

This project is licensed under the MIT License.

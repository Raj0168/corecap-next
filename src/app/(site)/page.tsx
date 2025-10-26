"use client";

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CommonButton from "./components/home/CommonButton";
import WhyCorecapSection from "./components/home/WhyCorecapSection";
import HowItWorks from "./components/home/HowItWorks";
import { useAuthStore } from "@/store/authStore";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const isAuthenticated = !!user;

  return (
    <>
      <Head>
        <link rel="icon" href="/logo.svg" />
        <title>CorecapMaths - Unlock Knowledge, Grow Your Skills</title>
        <meta
          name="description"
          content="Explore expert-led courses, flexible learning, and on-demand courses at CorecapMaths. Elevate your future with our online courses."
        />
        <meta
          name="keywords"
          content="online courses, expert-led courses, flexible learning, on-demand courses, education"
        />
      </Head>

      {/* HERO SECTION */}
      <section className="bg-[#0A2342] pb-16 pt-12 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Class 10 Maths.
            <br />
            Smartly Revised.
          </h1>
          <p className="text-white text-lg mb-1">
            Only what matters. Chapter-wise theory{" "}
            <span className="italic text-sm line-through opacity-70">
              mast-do
            </span>{" "}
            questions in compact PDFs.
          </p>
          <p className="text-white text-lg font-medium mb-6">
            Save time. Focus better. Score higher.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            {/* Explore Courses always visible */}
            <CommonButton
              onClick={() => router.push("/courses")}
              color="primary"
            >
              Explore Courses
            </CommonButton>

            {/* My Courses button only if logged in */}
            {isAuthenticated ? (
              <CommonButton
                onClick={() => router.push("/courses/my-courses")}
                color="secondary"
              >
                My Courses
              </CommonButton>
            ) : (
              // Optional: show a disabled skeleton placeholder
              <div className="w-36 h-10 bg-gray-300 rounded animate-pulse" />
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-white text-base mt-4">
              <Link
                href="/auth/login"
                className="text-yellow-400 font-semibold hover:underline"
              >
                Login
              </Link>{" "}
              for full experience!
            </p>
          )}
        </div>
      </section>

      <WhyCorecapSection />
      <HowItWorks />

      {/* ABOUT SECTION */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A2A49] mb-4">
            About Corecap
          </h2>
          <p className="text-[#1A2A49] text-lg">
            Corecap (Core + Recap) was born out a simple idea—revision should be
            sharp, stress-free, and effective. We remove the clutter and help
            you focus on what really matters.
          </p>
        </div>
      </section>
    </>
  );
}

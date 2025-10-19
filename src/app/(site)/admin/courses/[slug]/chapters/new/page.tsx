// src\app\(site)\admin\courses\[slug]\chapters\new\page.tsx

"use client";

import React from "react";
import ChapterForm from "@/app/(site)/components/admin/ChapterForm";
import { useRouter } from "next/navigation";

type Props = {
  params: { slug: string };
};

export default function NewChapterPage({ params }: Props) {
  const router = useRouter();
  
  const resolvedParams = React.use(Promise.resolve(params));
  const { slug } = resolvedParams;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Add Chapter to {slug}</h1>
      <ChapterForm
        courseSlug={slug}
        mode="create"
        onSuccess={() => {
          router.push(`/admin/courses/${slug}`);
        }}
      />
    </div>
  );
}

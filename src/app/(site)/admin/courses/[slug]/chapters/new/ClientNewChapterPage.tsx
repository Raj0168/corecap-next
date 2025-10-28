"use client";

import { useRouter } from "next/navigation";
import ChapterForm from "@/app/(site)/components/admin/ChapterForm";

export default function ClientNewChapterPage({ slug }: { slug: string }) {
  const router = useRouter();

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

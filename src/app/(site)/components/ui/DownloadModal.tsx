"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "./modal";

interface DownloadModalProps {
  url: string;
  filename: string;
  onClose?: () => void;
}

export default function DownloadModal({
  url,
  filename,
  onClose,
}: DownloadModalProps) {
  const [status, setStatus] = useState<"downloading" | "error" | "done">(
    "downloading"
  );

  useEffect(() => {
    const controller = new AbortController();

    async function download() {
      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error("Download failed");

        const blob = await res.blob();
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        setStatus("done");
        setTimeout(() => onClose?.(), 1000); // auto-close
      } catch (err: any) {
        if (err.name === "AbortError") {
          console.log("Download aborted");
        } else {
          console.error("Download failed", err);
          setStatus("error");
          setTimeout(() => onClose?.(), 2000);
        }
      }
    }

    download();
    return () => controller.abort();
  }, [url, filename, onClose]);

  return (
    <Modal onClose={onClose}>
      <div className="p-6 text-center space-y-4">
        {status === "downloading" && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto" />
            <p className="text-lg font-medium">Downloading...</p>
          </>
        )}
        {status === "done" && (
          <p className="text-green-600 font-medium">Download Complete!</p>
        )}
        {status === "error" && (
          <p className="text-red-600 font-medium">Download Failed</p>
        )}
      </div>
    </Modal>
  );
}

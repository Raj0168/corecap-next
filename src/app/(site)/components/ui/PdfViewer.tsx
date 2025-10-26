"use client";

import React, { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import type PDFJS from "pdfjs-dist/types/src/display/api";
import { Button } from "@/app/(site)/components/ui/button";

interface PdfViewerProps {
  filename: string; // GCS object name or signed URL
  initialPage?: number;
  initialZoom?: number;
  className?: string;
  canDownload?: boolean; // allow download button
}

export default function PdfViewer({
  filename,
  initialPage = 1,
  initialZoom = 1.25,
  className = "",
  canDownload = false,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRef = useRef<PDFJS.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch PDF using react-query ---
  const { data: pdfData, isLoading } = useQuery<ArrayBuffer, Error>({
    queryKey: ["pdf", filename],
    queryFn: async () => {
      const res = await api.get<ArrayBuffer>(
        `/pdf/${encodeURIComponent(filename)}`,
        {
          responseType: "arraybuffer",
        }
      );
      return res.data;
    },
    staleTime: 15 * 60 * 1000, // cache 5 minutes
    retry: 1,
  });

  useEffect(() => {
    if (!pdfData) return;

    let cancelled = false;

    (async () => {
      try {
        const pdfjsLib: typeof import("pdfjs-dist/legacy/build/pdf") =
          await import("pdfjs-dist/legacy/build/pdf");

        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

        // Make a copy of the ArrayBuffer to prevent "detached" errors
        const pdfBuffer = pdfData.slice(0);

        const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
        const pdfDoc = await loadingTask.promise;

        if (cancelled) {
          pdfDoc.destroy();
          return;
        }

        pdfRef.current = pdfDoc;
        setNumPages(pdfDoc.numPages);
        setPage((p) => (p > pdfDoc.numPages ? 1 : p));
      } catch (err: any) {
        console.error("PDF load error:", err);
        if (!cancelled) setError(err.message ?? "Failed to load PDF");
      }
    })();

    return () => {
      cancelled = true;
      if (pdfRef.current) {
        try {
          pdfRef.current.destroy();
        } catch {}
        pdfRef.current = null;
      }
    };
  }, [pdfData]);

  // --- Render current page ---
  useEffect(() => {
    if (!pdfRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setError("Failed to get canvas context");
      return;
    }

    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
      renderTaskRef.current = null;
    }

    let cancelled = false;

    (async () => {
      try {
        const pdfDoc = pdfRef.current!;
        const pageObj = await pdfDoc.getPage(page);

        const dpr = Math.max(window.devicePixelRatio || 1, 1);
        const viewport = pageObj.getViewport({ scale: zoom });

        canvas.width = Math.floor(viewport.width * dpr);
        canvas.height = Math.floor(viewport.height * dpr);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const renderTask = pageObj.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = renderTask;
        await renderTask.promise;
        renderTaskRef.current = null;
      } catch (err: any) {
        if (err?.name === "RenderingCancelledException") return;
        console.error("Render error:", err);
        if (!cancelled) setError(err.message ?? "Render failed");
      }
    })();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
      }
    };
  }, [page, zoom, numPages, pdfData]);

  // --- Controls ---
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () =>
    setPage((p) => Math.min(numPages || p + 1, numPages || p));
  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  return (
    <div className={`w-full ${className}`}>
      {/* Controls */}
      <div className="flex items-center gap-3 mb-3">
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={goPrev}
          disabled={isLoading || page <= 1}
        >
          ◀ Prev
        </button>
        <button
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          onClick={goNext}
          disabled={isLoading || page >= numPages}
        >
          Next ▶
        </button>
        <div className="ml-4 text-sm">
          Page {page} / {numPages || "—"}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={zoomOut}
            disabled={isLoading}
          >
            −
          </button>
          <div className="text-sm">{Math.round(zoom * 100)}%</div>
          <button
            className="px-2 py-1 bg-gray-200 rounded"
            onClick={zoomIn}
            disabled={isLoading}
          >
            +
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {isLoading && (
        <div className="p-6 text-center text-indigo-600">Loading PDF…</div>
      )}
      {error && <div className="text-red-600 p-2">Error: {error}</div>}

      {/* Canvas */}
      <div className="flex justify-center overflow-auto border rounded-md bg-white">
        <canvas ref={canvasRef} />
      </div>

      {/* Optional Download */}
      {canDownload && (
        <div className="mt-3">
          <Button
            variant="outline"
            onClick={() => {
              const url = `/pdf/${encodeURIComponent(filename)}`;
              window.open(url, "_blank");
            }}
            disabled={isLoading}
          >
            Download PDF
          </Button>
        </div>
      )}
    </div>
  );
}

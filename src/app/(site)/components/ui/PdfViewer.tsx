"use client";

import React, { useRef, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/utils/api";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import type PDFJS from "pdfjs-dist/types/src/display/api";

interface PdfViewerProps {
  filename: string;
  initialPage?: number;
  initialZoom?: number;
  className?: string;
}

export default function PdfViewer({
  filename,
  initialPage = 1,
  className = "",
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pdfRef = useRef<PDFJS.PDFDocumentProxy | null>(null);
  const renderTaskRef = useRef<any>(null);

  const [numPages, setNumPages] = useState<number>(0);
  const [page, setPage] = useState<number>(initialPage);
  const [zoom, setZoom] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const { data: pdfData, isLoading } = useQuery<ArrayBuffer, Error>({
    queryKey: ["pdf", filename],
    queryFn: async () => {
      const res = await api.get(`/pdf/${encodeURIComponent(filename)}`, {
        responseType: "arraybuffer",
      });
      return res.data;
    },
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setZoom(isMobile ? 0.75 : 1.5);
  }, []);

  useEffect(() => {
    if (!pdfData) return;
    let cancelled = false;

    (async () => {
      try {
        const pdfjsLib: typeof import("pdfjs-dist/legacy/build/pdf") =
          await import("pdfjs-dist/legacy/build/pdf");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.js";

        const loadingTask = pdfjsLib.getDocument({ data: pdfData.slice(0) });
        const pdfDoc = await loadingTask.promise;
        if (cancelled) return;

        pdfRef.current = pdfDoc;
        setNumPages(pdfDoc.numPages);
        setPage((p) => (p > pdfDoc.numPages ? 1 : p));
      } catch {
        if (!cancelled) setError("Failed to load PDF");
      }
    })();

    return () => {
      cancelled = true;
      pdfRef.current?.destroy();
    };
  }, [pdfData]);

  useEffect(() => {
    if (!pdfRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    renderTaskRef.current?.cancel();

    (async () => {
      try {
        const pdfDoc = pdfRef.current!;
        const pageObj = await pdfDoc.getPage(page);
        const dpr = Math.max(window.devicePixelRatio || 1, 1);
        const viewport = pageObj.getViewport({ scale: zoom });

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const task = pageObj.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;
      } catch {}
    })();

    return () => {
      renderTaskRef.current?.cancel();
    };
  }, [page, zoom, numPages, pdfData]);

  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(numPages, p + 1));
  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));

  return (
    <div className={`w-full relative ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md border rounded-md p-2 mb-2 shadow-sm text-sm">
        <div className="text-gray-700 font-medium tracking-wide">
          Page {page} / {numPages || "—"}
        </div>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          <button
            onClick={goPrev}
            disabled={page <= 1}
            className="icon-btn"
            style={{ background: "#ffd600" }}
          >
            <span className="flex items-center">
              Previous <ChevronLeft className="w-4 h-4" />
            </span>
          </button>
          <button
            onClick={goNext}
            disabled={page >= numPages}
            className="icon-btn"
            style={{ background: "#ffd600" }}
          >
            <span className="flex items-center">
              Next <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={zoomOut} className="icon-btn" disabled={isLoading}>
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-medium text-gray-700 min-w-[48px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button onClick={zoomIn} className="icon-btn" disabled={isLoading}>
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="w-full flex justify-center">
          <div className="animate-pulse bg-gray-200 rounded-lg w-full max-w-3xl aspect-[3/4]" />
        </div>
      )}
      {error && <div className="text-red-600 p-2 text-center">{error}</div>}

      <div className="relative flex justify-center border rounded-md bg-white overflow-auto min-h-[300px]">
        <canvas ref={canvasRef} className="transition-all" />
      </div>

      {page > 1 && (
        <button onClick={goPrev} className="floating-nav left-2 md:hidden">
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {page < numPages && (
        <button onClick={goNext} className="floating-nav right-2 md:hidden">
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

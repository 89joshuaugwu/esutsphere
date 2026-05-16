"use client";

import { useState, use } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ZoomIn, ZoomOut, Download, ArrowLeft, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

/** 
 * Note: CSS imports for AnnotationLayer and TextLayer removed 
 * because they are not used and caused Vercel build errors.
 */

// Worker configuration using a reliable CDN
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MOCK_PDF = "https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf";

export default function DocumentPreviewPage({ params }: { params: Promise<{ docId: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [numPages, setNumPages] = useState<number>();
  const [scale, setScale] = useState(1.0);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-8">
      {/* Navigation */}
      <button 
        onClick={() => router.back()} 
        className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </button>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-[20px] md:text-3xl text-text-primary mb-1 break-words">
            MTH101 General Mathematics I Notes
          </h1>
          <p className="text-text-muted text-[12px] md:text-sm">
            Uploaded by @johndoe • PDF • 2.5MB
          </p>
        </div>
        <button className="h-9 md:h-10 px-4 bg-brand/10 text-brand-light font-medium rounded-lg hover:bg-brand/20 flex items-center gap-2 transition-all shrink-0 text-sm w-full sm:w-auto justify-center">
          <Download className="w-4 h-4" /> Download
        </button>
      </div>

      {/* PDF Viewer Container — FULLY CONTAINED, zoom does NOT push page */}
      <div
        className="bg-[#0F0F1A] border border-white/10 rounded-[12px] md:rounded-[14px] relative shadow-[0_8px_40px_rgba(0,0,0,0.4)] md:shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
        style={{ overflow: "hidden" }}
      >
        
        {/* Toolbar — sticky at top of viewer */}
        <div className="bg-[#0f0f1a]/95 backdrop-blur-[8px] border-b border-white/5 p-2 md:p-3 flex items-center justify-between sticky top-0 z-10">
          <span className="font-medium text-[11px] md:text-[13px] text-text-muted">
            {numPages ? `${numPages} Pages` : 'Loading...'}
          </span>
          <div className="flex items-center gap-1 md:gap-2">
            <button 
              onClick={() => setScale(s => Math.max(0.4, s - 0.15))} 
              className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            <span className="text-[11px] md:text-xs font-medium text-text-secondary w-10 md:w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(s => Math.min(2.5, s + 0.15))} 
              className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            {scale !== 1.0 && (
              <button 
                onClick={() => setScale(1.0)} 
                className="w-7 h-7 md:w-8 md:h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
                title="Reset zoom"
              >
                <RotateCcw className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 
          Scrollable Canvas Area
          KEY FIX: overflow-auto on BOTH axes means zoom only scrolls
          inside this container and NEVER pushes the outer page width.
        */}
        <div
          className="overflow-auto bg-bg-base/50"
          style={{ maxHeight: "calc(70vh)", WebkitOverflowScrolling: "touch" }}
        >
          <div className="p-3 md:p-5 flex flex-col items-center gap-3 md:gap-4 min-w-fit">
            <Document 
              file={MOCK_PDF} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center h-64 text-text-muted gap-3">
                  <span className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading PDF document...</p>
                </div>
              }
              error={<div className="p-8 md:p-12 text-center text-text-muted text-sm">Failed to load PDF document.</div>}
            >
              {Array.from(new Array(numPages || 0), (_, index) => (
                <div 
                  key={`page_${index + 1}`} 
                  className="mb-3 md:mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded bg-white overflow-hidden"
                >
                  <Page 
                    pageNumber={index + 1} 
                    scale={scale} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div 
                        style={{ width: Math.min(600, 320) * scale, height: Math.min(800, 450) * scale }} 
                        className="bg-white/5 animate-pulse" 
                      />
                    }
                  />
                </div>
              ))}
            </Document>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, use } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ZoomIn, ZoomOut, Download, ArrowLeft } from "lucide-react";
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
          <h1 className="font-display text-[22px] md:text-3xl text-text-primary mb-1 break-words">
            MTH101 General Mathematics I Notes
          </h1>
          <p className="text-text-muted text-[13px] md:text-sm">
            Uploaded by @johndoe • PDF • 2.5MB
          </p>
        </div>
        <button className="h-9 md:h-10 px-4 bg-brand/10 text-brand-light font-medium rounded-lg hover:bg-brand/20 flex items-center gap-2 transition-all shrink-0 text-sm">
          <Download className="w-4 h-4" /> Download
        </button>
      </div>

      {/* PDF Viewer Container — overflow contained */}
      <div className="bg-[#0F0F1A] border border-white/10 rounded-[14px] overflow-hidden relative shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        
        {/* Toolbar */}
        <div className="bg-[#0f0f1a]/95 backdrop-blur-[8px] border-b border-white/5 p-2.5 md:p-3 flex items-center justify-between sticky top-0 z-10">
          <span className="font-medium text-[12px] md:text-[13px] text-text-muted">
            {numPages ? `${numPages} Pages` : 'Loading...'}
          </span>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button 
              onClick={() => setScale(s => Math.max(0.5, s - 0.2))} 
              className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-text-secondary w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <button 
              onClick={() => setScale(s => Math.min(2.5, s + 0.2))} 
              className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Canvas Area — both axes for zoom */}
        <div className="overflow-auto max-h-[70vh] md:max-h-[75vh] bg-bg-base/50">
          <div
            className="p-4 md:p-5 flex flex-col items-center gap-4"
            style={{ minWidth: scale > 1 ? `${Math.round(600 * scale + 40)}px` : 'auto' }}
          >
            <Document 
              file={MOCK_PDF} 
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center justify-center h-64 text-text-muted gap-3">
                  <span className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm">Loading PDF document...</p>
                </div>
              }
              error={<div className="p-12 text-center text-text-muted">Failed to load PDF document.</div>}
            >
              {Array.from(new Array(numPages || 0), (_, index) => (
                <div 
                  key={`page_${index + 1}`} 
                  className="mb-4 md:mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded bg-white overflow-hidden"
                >
                  <Page 
                    pageNumber={index + 1} 
                    scale={scale} 
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    loading={
                      <div 
                        style={{ width: 600 * scale, height: 800 * scale }} 
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

"use client";
import { useState, use } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { ZoomIn, ZoomOut, Download, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Use Cloudflare CDN for worker to avoid build/import issues in Next.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

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
    <div className="space-y-6">
      <button onClick={() => router.back()} className="text-text-muted hover:text-text-primary flex items-center gap-2 text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-text-primary mb-1">MTH101 General Mathematics I Notes</h1>
          <p className="text-text-muted text-sm">Uploaded by @johndoe • PDF • 2.5MB</p>
        </div>
        <button className="h-10 px-4 bg-brand/10 text-brand-light font-medium rounded-lg hover:bg-brand/20 flex items-center gap-2 transition-all">
          <Download className="w-4 h-4" /> Download
        </button>
      </div>

      <div className="pdf-viewer-wrapper bg-[#0F0F1A] border border-white/10 rounded-[14px] overflow-hidden relative shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
        <div className="pdf-toolbar bg-[#0f0f1a]/95 backdrop-blur-[8px] border-b border-white/5 p-3 flex items-center justify-between sticky top-0 z-10">
          <span className="pdf-page-count font-medium text-[13px] text-text-muted">
            {numPages ? `${numPages} Pages` : 'Loading...'}
          </span>
          <div className="flex items-center gap-2">
            <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium text-text-secondary w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={() => setScale(s => Math.min(2.5, s + 0.2))} className="w-8 h-8 rounded-md bg-white/5 hover:bg-white/10 flex items-center justify-center text-text-muted hover:text-white transition-colors">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pdf-canvas-area p-5 overflow-y-auto max-h-[70vh] flex flex-col items-center gap-4 bg-bg-base/50">
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
            {Array.from(new Array(numPages || 0), (el, index) => (
              <div key={`page_${index + 1}`} className="mb-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)] rounded bg-white overflow-hidden">
                <Page 
                  pageNumber={index + 1} 
                  scale={scale} 
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<div className="w-[600px] h-[800px] bg-white/5 animate-pulse" />}
                />
              </div>
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { PHASES } from "@/lib/constants";
import type { WeeklyPdf, PhaseId } from "@/types/database";

export default function PDFsPage() {
  const [pdfs, setPdfs] = useState<WeeklyPdf[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState<PhaseId | 'all'>('all');

  // Fetch PDFs
  useEffect(() => {
    async function fetchPDFs() {
      setLoading(true);
      const supabase = createClient();

      const { data, error } = await supabase
        .from('weekly_pdfs')
        .select('*')
        .order('phase_id')
        .order('week_number');

      if (error) {
        console.error('Error fetching PDFs:', error);
      } else {
        setPdfs(data || []);
      }
      setLoading(false);
    }

    fetchPDFs();
  }, []);

  // Group PDFs by phase
  const groupedPDFs = useMemo(() => {
    const filtered = selectedPhase === 'all'
      ? pdfs
      : pdfs.filter(pdf => pdf.phase_id === selectedPhase);

    const groups: Record<string, WeeklyPdf[]> = {};

    for (const pdf of filtered) {
      if (!groups[pdf.phase_id]) {
        groups[pdf.phase_id] = [];
      }
      groups[pdf.phase_id].push(pdf);
    }

    return groups;
  }, [pdfs, selectedPhase]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="heading-serif text-3xl sm:text-4xl mb-3 not-italic font-semibold text-[var(--scandi-charcoal)]">
          PDF Downloads
        </h1>
        <p className="text-[var(--text-muted)]">
          Access and download all weekly nutrition guides from the Ajenda program.
        </p>
      </div>

      {/* Phase Filter */}
      <div className="card overflow-hidden mb-8">
        <div className="section-header-bar">Filter by Phase</div>
        <div className="p-4 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
              selectedPhase === 'all'
                ? 'bg-[var(--ajenda-red)] text-white'
                : 'bg-[var(--scandi-linen)] text-[var(--scandi-charcoal)] hover:bg-[var(--scandi-birch)]'
            }`}
          >
            All Phases
          </button>
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                selectedPhase === phase.id
                  ? 'bg-[var(--ajenda-red)] text-white'
                  : 'bg-[var(--scandi-linen)] text-[var(--scandi-charcoal)] hover:bg-[var(--scandi-birch)]'
              }`}
            >
              {phase.name}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-32 bg-[var(--scandi-linen)] rounded mb-4"></div>
              <div className="h-4 bg-[var(--scandi-linen)] rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-[var(--scandi-linen)] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedPDFs).length === 0 ? (
        <div className="text-center py-12 card">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-[var(--scandi-charcoal)] mb-2">No PDFs Available</h3>
          <p className="text-[var(--text-muted)]">
            PDFs have not been uploaded yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {PHASES.map((phase) => {
            const phasePDFs = groupedPDFs[phase.id];
            if (!phasePDFs || phasePDFs.length === 0) return null;

            return (
              <section key={phase.id}>
                <h2 className="heading-serif text-xl text-[var(--scandi-charcoal)] mb-4 flex items-center gap-3 not-italic font-medium">
                  <span>{phase.name}</span>
                  <span className="text-sm font-normal text-[var(--text-muted)]">
                    ({phasePDFs.length} {phasePDFs.length === 1 ? 'week' : 'weeks'})
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {phasePDFs
                    .sort((a, b) => a.week_number - b.week_number)
                    .map((pdf) => (
                      <PDFCard key={pdf.id} pdf={pdf} phaseName={phase.name} />
                    ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PDFCard({ pdf, phaseName }: { pdf: WeeklyPdf; phaseName: string }) {
  const weekLabel = pdf.week_number === 0 ? 'Bonus' : `Week ${pdf.week_number}`;

  return (
    <div className="card overflow-hidden flex flex-col">
      {/* PDF Preview */}
      <div className="bg-[var(--scandi-linen)] h-28 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-10 h-10 mx-auto text-[var(--ajenda-blue)] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div className="text-xs text-[var(--text-muted)] mt-1 uppercase tracking-wider">PDF</div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex-1">
        <h3 className="font-semibold text-[var(--scandi-charcoal)] mb-1">
          {phaseName} - {weekLabel}
        </h3>
        {pdf.total_pages && (
          <p className="text-sm text-[var(--text-muted)]">{pdf.total_pages} pages</p>
        )}
      </div>

      {/* Download Button */}
      <div className="p-4 pt-0">
        {pdf.pdf_url ? (
          <a
            href={pdf.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary w-full text-center text-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </a>
        ) : (
          <button
            disabled
            className="w-full px-4 py-2 bg-[var(--scandi-linen)] text-[var(--text-muted)] rounded text-sm cursor-not-allowed"
          >
            Not Available
          </button>
        )}
      </div>
    </div>
  );
}

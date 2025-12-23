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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Downloads</h1>
        <p className="text-gray-600">
          Access and download all weekly nutrition guides from the Ajenda program.
        </p>
      </div>

      {/* Phase Filter */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedPhase('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedPhase === 'all'
                ? 'bg-[var(--ajenda-red)] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Phases
          </button>
          {PHASES.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedPhase === phase.id
                  ? 'bg-[var(--ajenda-red)] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              <div className="h-32 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : Object.keys(groupedPDFs).length === 0 ? (
        <div className="text-center py-12 card">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No PDFs Available</h3>
          <p className="text-gray-600">
            PDFs have not been uploaded yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {PHASES.map((phase) => {
            const phasePDFs = groupedPDFs[phase.id];
            if (!phasePDFs || phasePDFs.length === 0) return null;

            return (
              <section key={phase.id}>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>{phase.name}</span>
                  <span className="text-sm font-normal text-gray-500">
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
    <div className="card p-4 flex flex-col">
      {/* PDF Preview */}
      <div className="bg-gray-100 rounded-lg h-32 flex items-center justify-center mb-4">
        <div className="text-center">
          <div className="text-4xl mb-1">📄</div>
          <div className="text-xs text-gray-500">PDF</div>
        </div>
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">
          {phaseName} - {weekLabel}
        </h3>
        {pdf.total_pages && (
          <p className="text-sm text-gray-500">{pdf.total_pages} pages</p>
        )}
      </div>

      {/* Download Button */}
      {pdf.pdf_url ? (
        <a
          href={pdf.pdf_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 btn-primary text-center text-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </a>
      ) : (
        <button
          disabled
          className="mt-4 px-4 py-2 bg-gray-100 text-gray-400 rounded-md text-sm cursor-not-allowed"
        >
          Not Available
        </button>
      )}
    </div>
  );
}

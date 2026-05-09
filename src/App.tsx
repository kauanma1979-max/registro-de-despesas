/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Table, Search, Download, AlertCircle, FileSpreadsheet, ChevronRight, Wand2, ArrowLeft } from 'lucide-react';
import { fetchSheetData, type SheetData } from './lib/sheets';
import { analyzeSheetData } from './lib/gemini';
import Markdown from 'react-markdown';

export default function App() {
  const DEFAULT_URL = 'https://docs.google.com/spreadsheets/d/1lyXkSmeiyyODZbng6GtXTSwNR-XY2KWRLKWqppLef1k/edit?gid=980751451#gid=980751451';
  const [url, setUrl] = React.useState(DEFAULT_URL);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sheetData, setSheetData] = React.useState<SheetData | null>(null);
  const [analysis, setAnalysis] = React.useState<string | null>(null);
  const [analyzing, setAnalyzing] = React.useState(false);

  const performImport = async (targetUrl: string) => {
    setLoading(true);
    setError(null);
    setSheetData(null);
    setAnalysis(null);

    try {
      const data = await fetchSheetData(targetUrl);
      setSheetData(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    performImport(DEFAULT_URL);
  }, []);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    performImport(url);
  };

  const handleAnalyze = async () => {
    if (!sheetData) return;
    setAnalyzing(true);
    try {
      const result = await analyzeSheetData(sheetData.rows);
      setAnalysis(result || 'Nenhuma análise disponível.');
    } catch (err) {
      setAnalysis('Erro ao analisar os dados.');
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setSheetData(null);
    setAnalysis(null);
    setUrl('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-[#1D1D1F] selection:bg-[#E8E8ED] selection:text-[#000]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-[#F5F5F7] rounded-full blur-[120px] opacity-50" />
        <div className="absolute top-[60%] -right-[5%] w-[30%] h-[40%] bg-[#E8E8ED] rounded-full blur-[100px] opacity-30" />
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 border-b border-[#E8E8ED]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <div className="w-8 h-8 bg-[#1D1D1F] rounded-lg flex items-center justify-center text-white">
              <FileSpreadsheet size={18} />
            </div>
            <span>SheetFlux</span>
          </div>
          {sheetData && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-[#0066CC] hover:underline flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Importar nova planilha
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {!sheetData ? (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5F7] text-[#86868B] text-xs font-semibold mb-8 tracking-wide uppercase">
                <Wand2 size={12} />
                Insights instantâneos
              </div>
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
                Importe dados do Google Sheets facilmente.
              </h1>
              <p className="text-xl text-[#86868B] leading-relaxed mb-10 max-w-lg mx-auto">
                Transforme suas planilhas estáticas em um painel dinâmico e use IA para descobrir padrões ocultos.
              </p>

              <form onSubmit={handleImport} className="relative group">
                <input
                  type="url"
                  placeholder="Cole o link da sua planilha aqui (ex: docs.google.com/...)"
                  className="w-full h-16 px-6 pr-32 rounded-2xl bg-white border border-[#D2D2D7] focus:border-[#0066CC] focus:ring-4 focus:ring-[#0066CC]/10 outline-none transition-all text-lg shadow-sm group-hover:shadow-md"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="absolute right-2 top-2 bottom-2 px-6 bg-[#1D1D1F] text-white rounded-xl font-medium hover:bg-[#000] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Continuar
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {error && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-start gap-3 text-left"
                >
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold mb-1">Erro na importação</p>
                    <p>{error}</p>
                    <p className="mt-2 text-xs opacity-80">
                      Certifique-se de que a planilha está compartilhada com "Qualquer pessoa com o link pode ler".
                    </p>
                  </div>
                </motion.div>
              )}

              <div className="mt-16 grid grid-cols-3 gap-8">
                {[
                  { label: "Rápido", desc: "Extraia dados em segundos" },
                  { label: "Privado", desc: "Processamento seguro" },
                  { label: "Inteligente", desc: "Análise com IA Gemini" }
                ].map((item, i) => (
                  <div key={i} className="text-left p-6 rounded-2xl bg-[#F5F5F7]/50 border border-transparent hover:border-[#E8E8ED] transition-colors">
                    <div className="font-bold mb-1">{item.label}</div>
                    <div className="text-sm text-[#86868B]">{item.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">Painel de Dados</h2>
                  <p className="text-[#86868B] mt-1">Exibindo {sheetData.rows.length} registros importados.</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={handleAnalyze}
                    disabled={analyzing}
                    className="h-11 px-5 bg-white border border-[#D2D2D7] rounded-xl font-medium hover:bg-[#F5F5F7] transition-all flex items-center gap-2 shadow-sm"
                  >
                    {analyzing ? (
                      <div className="w-4 h-4 border-2 border-[#1D1D1F]/20 border-t-[#1D1D1F] rounded-full animate-spin" />
                    ) : (
                      <Wand2 size={16} />
                    )}
                    {analysis ? 'Analisar novamente' : 'Analisar com IA'}
                  </button>
                  <button className="h-11 px-5 bg-white border border-[#D2D2D7] rounded-xl font-medium hover:bg-[#F5F5F7] transition-all flex items-center gap-2 shadow-sm">
                    <Download size={16} />
                    Exportar
                  </button>
                </div>
              </div>

              {analysis && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#1D1D1F] text-white p-8 rounded-3xl shadow-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Wand2 size={120} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-[#86868B] text-xs font-bold uppercase tracking-widest mb-6">
                      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                      Insight da IA Gemini
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none prose-headings:font-bold prose-p:text-gray-300">
                      <Markdown>{analysis}</Markdown>
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="bg-white rounded-3xl border border-[#E8E8ED] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="bg-[#F5F5F7] border-b border-[#E8E8ED]">
                        {sheetData.headers.map((header, i) => (
                          <th key={i} className="px-6 py-4 font-semibold text-[#86868B] uppercase tracking-wider text-[10px]">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8E8ED]">
                      {sheetData.rows.slice(0, 100).map((row, i) => (
                        <tr key={i} className="hover:bg-[#F5F5F7]/30 transition-colors">
                          {sheetData.headers.map((header, j) => (
                            <td key={j} className="px-6 py-4 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs">
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {sheetData.rows.length > 100 && (
                  <div className="p-4 text-center bg-[#F5F5F7]/30 border-t border-[#E8E8ED] text-[#86868B] text-xs">
                    Mostrando os primeiros 100 registros.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className="py-12 px-6 border-t border-[#E8E8ED] text-center text-[#86868B] text-sm">
        <p>© 2026 SheetFlux Labs. Desenvolvido para transformar dados em decisões.</p>
      </footer>
    </div>
  );
}

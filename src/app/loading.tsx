import {
  Landmark,
  Wallet,
  Users,
  ArrowUpRight,
} from "lucide-react";

export default function LoadingDashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-pulse">
      {/* HEADER DE BOAS-VINDAS */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-8 w-64 bg-zinc-800 rounded-lg mb-2"></div>
          <div className="h-4 w-96 bg-zinc-800/60 rounded-lg mt-1"></div>
        </div>
      </div>

      {/* CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[Landmark, Wallet, Users].map((Icon, i) => (
          <div key={i} className="bg-card border border-border/40 rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden h-[180px]">
            <div className="space-y-3">
              <div className="h-4 w-32 bg-zinc-800/80 rounded"></div>
              <div className="h-10 w-48 bg-zinc-800 rounded-lg"></div>
            </div>
            <div className="flex items-center gap-2 mt-6">
              <div className="h-6 w-24 bg-zinc-800/60 rounded-full"></div>
              <div className="h-3 w-16 bg-zinc-800/40 rounded"></div>
            </div>
            <Icon className="absolute right-6 top-6 w-12 h-12 text-zinc-800/50" />
          </div>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (Charts & Faturas) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Fluxo de Caixa Chart */}
          <div className="bg-card border border-border/40 rounded-3xl p-6 h-[400px] flex flex-col relative overflow-hidden">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="h-6 w-48 bg-zinc-800 rounded-lg mb-2"></div>
                <div className="h-4 w-72 bg-zinc-800/60 rounded"></div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-3 w-16 bg-zinc-800/60 rounded"></div>
                <div className="h-3 w-16 bg-zinc-800/60 rounded"></div>
              </div>
            </div>

            {/* Fake Chart bars skeleton */}
            <div className="flex-1 flex items-end justify-between px-4 pb-2 relative">
                <div className="absolute inset-0 flex flex-col justify-between pt-10 pb-8 pointer-events-none">
                  {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-full h-px bg-zinc-800/30" />
                  ))}
                </div>
                
                <div className="w-full flex justify-between items-end h-[240px] z-10 px-6 pb-8">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 w-12">
                        <div className="w-full h-32 flex items-end justify-center gap-1.5">
                          <div className="w-3 bg-zinc-800/80 rounded-t-sm h-[60%]" />
                          <div className="w-3 bg-zinc-700/80 rounded-t-sm h-[80%]" />
                        </div>
                        <div className="w-8 h-3 bg-zinc-800/50 rounded mt-1"></div>
                    </div>
                  ))}
                </div>
            </div>
          </div>

          {/* Faturas Pendentes List */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="h-6 w-40 bg-zinc-800 rounded-lg"></div>
              <div className="h-4 w-16 bg-zinc-800/60 rounded"></div>
            </div>
            
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/30 border border-border/20">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800"></div>
                    <div className="space-y-2">
                       <div className="h-4 w-32 bg-zinc-800 rounded"></div>
                       <div className="h-3 w-48 bg-zinc-800/60 rounded"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                    <div className="h-4 w-16 bg-zinc-800/50 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN (Widgets) */}
        <div className="xl:col-span-1 space-y-8">
          
          {/* Próximos Recebimentos */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-zinc-800 flex items-center justify-center">
                <ArrowUpRight className="w-4 h-4 text-zinc-700" />
              </div>
              <div className="h-6 w-48 bg-zinc-800 rounded-lg"></div>
            </div>

            <div className="space-y-6">
               {[...Array(2)].map((_, i) => (
                 <div key={i}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-800"></div>
                        <div className="space-y-2">
                           <div className="h-4 w-28 bg-zinc-800 rounded"></div>
                           <div className="h-3 w-20 bg-zinc-800/60 rounded"></div>
                        </div>
                      </div>
                      <div className="h-4 w-20 bg-zinc-800 rounded"></div>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full"></div>
                 </div>
               ))}
            </div>
             <div className="h-10 w-full bg-zinc-800/50 rounded-xl mt-6"></div>
          </div>

          {/* Contas Vinculadas */}
          <div className="bg-card border border-border/40 rounded-3xl p-6">
            <div className="h-5 w-36 bg-zinc-800 rounded-lg mb-6"></div>
            
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-800"></div>
                      <div className="space-y-2">
                         <div className="h-4 w-24 bg-zinc-800 rounded"></div>
                         <div className="h-3 w-16 bg-zinc-800/60 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-20 bg-zinc-800 rounded"></div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

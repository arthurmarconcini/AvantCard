"use client";

import { useState, useRef } from "react";
import { CreditCard, ShoppingCart, ArrowDownRight, Tag, User, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPurchaseModal } from "@/components/add-purchase-modal";
import { getInvoiceDateForTransaction } from "@/lib/billing";

// Formatadores
const formatCurrency = (valueInCents: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInCents / 100);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(new Date(date));
};

// Tipagens baseadas nos dados do Prisma retornados p/ o client
interface Transaction {
  id: string;
  amount: number;
  direction: "DEBIT" | "CREDIT";
  description: string | null;
  transactionDate: Date;
  postingDate?: Date | null;
  installmentTotal?: number | null;
  installmentNumber?: number | null;
  category?: { name: string } | null;
  person?: { name: string } | null;
}

interface Card {
  id: string;
  name: string;
  last4: string | null;
  billingDay: number | null;
  dueDay: number | null;
  creditLimit: number | null;
  transactions: Transaction[];
}

export function CardsClientPage({
  cards,
  persons,
  categories,
  initialCardId,
}: {
  cards: Card[];
  persons: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  initialCardId?: string;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const resolvedInitialCard = initialCardId && cards.some(c => c.id === initialCardId) ? initialCardId : (cards.length > 0 ? cards[0].id : null);
  const [selectedCardId, setSelectedCardId] = useState(resolvedInitialCard);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 600 : 300;
      carouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - carouselRef.current.offsetLeft);
    setScrollLeft(carouselRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDragging(false);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - startX) * 1.2; 
    carouselRef.current.scrollLeft = scrollLeft - walk;
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId);


  const [invoiceDate, setInvoiceDate] = useState(new Date());
  
  const previousMonth = () => {
    setInvoiceDate(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setInvoiceDate(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 1));
  };
  
  const invoiceMonthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(invoiceDate);

  const totalGlobalSpent = selectedCard?.transactions.reduce(
    (acc: number, t: Transaction) => acc + (t.direction === "DEBIT" ? Number(t.amount) : -Number(t.amount)),
    0
  ) || 0;

  const currentInvoiceTransactions = selectedCard?.transactions.filter(t => {
    const d = getInvoiceDateForTransaction(t, selectedCard);
    return d.getMonth() === invoiceDate.getMonth() && d.getFullYear() === invoiceDate.getFullYear();
  }) || [];

  const invoiceSpent = currentInvoiceTransactions.reduce((acc, t) => acc + (t.direction === "DEBIT" ? Number(t.amount) : -Number(t.amount)), 0);

  const creditLimit = selectedCard?.creditLimit ? Number(selectedCard.creditLimit) : 0;
  const availableLimit = Math.max(0, creditLimit - totalGlobalSpent);
  const limitPercentage = creditLimit > 0 ? (totalGlobalSpent / creditLimit) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Cartões de Crédito</h1>
          <p className="text-zinc-400">Gerencie seus limites, faturas e gastos parcelados.</p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl font-bold h-11 px-7 shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(57,255,20,0.45)] hover:scale-[1.03] active:scale-[0.98] group/btn"
        >
          <ShoppingCart className="w-5 h-5 mr-2 transition-transform duration-300 group-hover/btn:-translate-y-px" />
          Nova Compra
        </Button>
      </div>

      {cards.length === 0 ? (
        <div className="bg-card/50 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <CreditCard className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold mb-2">Nenhum Cartão Encontrado</h2>
          <p className="text-zinc-500 mb-6 max-w-sm">Você não possui nenhum cartão de crédito configurado. Vá até a aba de Contas para adicionar seu primeiro cartão.</p>
        </div>
      ) : (
        <>
          <div className="relative group">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scrollCarousel('left')} 
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 -translate-x-4 rounded-full border-white/10 bg-zinc-950/90 backdrop-blur-md text-white shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:bg-zinc-800 transition-all hidden md:flex"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => scrollCarousel('right')} 
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-12 w-12 translate-x-4 rounded-full border-white/10 bg-zinc-950/90 backdrop-blur-md text-white shadow-[0_0_30px_rgba(0,0,0,0.8)] opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 hover:bg-zinc-800 transition-all hidden md:flex"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>

            <div 
               ref={carouselRef}
               onMouseDown={handleMouseDown}
               onMouseLeave={handleMouseLeave}
               onMouseUp={handleMouseUp}
               onMouseMove={handleMouseMove}
               className={`flex gap-4 overflow-x-auto pb-6 pt-2 custom-scrollbar select-none ${isDragging ? '' : 'snap-x snap-mandatory'}`}
               style={{ cursor: isDragging ? 'grabbing' : 'grab', scrollBehavior: isDragging ? 'auto' : 'smooth' }}
            >
              {cards.map((card) => {
                const spent = card.transactions.reduce((acc: number, t: Transaction) => acc + Number(t.amount), 0);
                const limit = card.creditLimit ? Number(card.creditLimit) : 0;
                const isSelected = selectedCardId === card.id;

                const availableLimit = Math.max(0, limit - spent);

                return (
                  <div
                    key={card.id}
                    onClick={() => setSelectedCardId(card.id)}
                    className={`relative p-6 rounded-3xl cursor-pointer overflow-hidden transition-all duration-300 border backdrop-blur-xl min-w-[85vw] md:min-w-[320px] shrink-0 snap-center flex flex-col justify-between ${
                      isSelected
                        ? "bg-zinc-900 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.1)] ring-1 ring-primary/20"
                        : "bg-zinc-900/40 border-white/5 hover:border-white/20 hover:bg-zinc-900/60"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
                    )}

                    <div className="flex justify-between items-start mb-8 relative z-10 gap-2">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-white/5 text-zinc-400'}`}>
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-lg truncate" title={card.name}>{card.name}</p>
                          <p className="text-xs text-zinc-500 font-mono tracking-widest truncate">
                            •••• {card.last4 || "0000"}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={`shrink-0 ${isSelected ? "border-primary/30 text-primary bg-primary/10" : "border-white/10 text-zinc-400"}`}>
                        Dia {card.dueDay || "--"}
                      </Badge>
                    </div>

                    <div className="space-y-2 relative z-10">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Fatura Atual</span>
                        <span className="font-bold">{formatCurrency(spent)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500 text-xs">Limite Disp.</span>
                        <span className="text-zinc-400 text-xs">{formatCurrency(availableLimit)}</span>
                      </div>
                      
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mt-2">
                         <div 
                           className={`h-full rounded-full transition-all duration-500 ${isSelected ? 'bg-primary' : 'bg-zinc-600'}`}
                           style={{ width: `${Math.min(100, limit > 0 ? (spent / limit) * 100 : 0)}%` }}
                         />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {selectedCard && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 mt-8 fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    Fatura <span className="text-primary">{selectedCard.name}</span>
                  </h3>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <Button variant="outline" size="icon" onClick={previousMonth} className="h-8 w-8 rounded-full border-white/10 hover:bg-white/10 text-zinc-400 bg-transparent">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-semibold capitalize min-w-[120px] text-center text-zinc-200">
                      {invoiceMonthName}
                    </span>
                    <Button variant="outline" size="icon" onClick={nextMonth} className="h-8 w-8 rounded-full border-white/10 hover:bg-white/10 text-zinc-400 bg-transparent">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="text-right flex flex-col items-end">
                   <p className="text-sm font-medium text-zinc-400 mb-1">Total da Fatura</p>
                   <p className="text-3xl font-extrabold text-white">{formatCurrency(invoiceSpent)}</p>
                   {creditLimit > 0 && (
                     <div className="mt-2 w-48">
                        <div className="flex justify-between text-xs text-zinc-500 mb-1">
                          <span>Disp: <span className="text-primary">{formatCurrency(availableLimit)}</span></span>
                          <span>{limitPercentage.toFixed(0)}% uso</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-primary transition-all duration-500"
                            style={{ width: `${Math.min(100, limitPercentage)}%` }}
                          />
                        </div>
                     </div>
                   )}
                </div>
              </div>

              {currentInvoiceTransactions.length === 0 ? (
                <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl text-center">
                  <p className="text-zinc-500 text-sm">Nenhuma compra faturada neste mês.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentInvoiceTransactions.map((t: Transaction) => (
                    <div key={t.id} className="group flex items-center justify-between p-4 rounded-2xl bg-zinc-950/30 border border-white/5 hover:border-white/10 hover:bg-zinc-900/60 transition-colors">
                      
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
                          <ArrowDownRight className="w-5 h-5" />
                        </div>
                        
                        <div className="flex flex-col gap-1">
                          <p className="font-semibold text-sm">{t.description}</p>
                          <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                            <span>{formatDate(t.transactionDate)}</span>
                            {t.category && (
                              <span className="flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                <Tag className="w-3 h-3 ml-1" />
                                {t.category.name}
                              </span>
                            )}
                            {t.person && (
                              <span className="flex items-center gap-1 text-primary/70">
                                <span className="w-1 h-1 rounded-full bg-primary/30" />
                                <User className="w-3 h-3 ml-1" />
                                {t.person.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <span className="font-bold text-sm">{formatCurrency(Number(t.amount))}</span>
                        {t.installmentTotal && t.installmentTotal > 1 ? (
                           <Badge variant="outline" className="mt-1 py-0 text-[10px] border-white/10 text-zinc-400 bg-white/5">
                             {t.installmentNumber}/{t.installmentTotal}
                           </Badge>
                        ) : null}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <AddPurchaseModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        cards={cards.map((c) => {
          const spent = c.transactions.reduce((acc: number, t: Transaction) => acc + Number(t.amount), 0);
          const limit = c.creditLimit ? Number(c.creditLimit) : 0;
          return { id: c.id, name: c.name, availableLimit: Math.max(0, limit - spent) };
        })}
        categories={categories}
        persons={persons}
        defaultAccountId={selectedCardId || undefined}
      />
    </div>
  );
}

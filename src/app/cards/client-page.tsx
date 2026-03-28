"use client";

import { useState } from "react";
import { CreditCard, ShoppingCart, ArrowDownRight, ArrowUpRight, CheckCircle2, Tag, User, ChevronLeft, ChevronRight, Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AddPurchaseModal } from "@/components/add-purchase-modal";
import { AddCreditCardModal } from "./_components/add-credit-card-modal";
import { EditCreditCardModal } from "./_components/edit-credit-card-modal";
import { CardsSummary } from "./_components/cards-summary";
import { PayBillModal } from "./_components/pay-bill-modal";
import { getInvoiceDateForTransaction } from "@/lib/billing";
import { formatCurrency, formatDate } from "@/lib/format";

// Tipagens baseadas nos dados do Prisma retornados p/ o client
interface Transaction {
  id: string;
  type?: string;
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
  summaryData,
}: {
  cards: Card[];
  persons: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  initialCardId?: string;
  summaryData: {
    totalCreditLimit: number;
    totalCreditUsed: number;
    loanedFromCards: number;
    cardsCount: number;
  };
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [isPayBillModalOpen, setIsPayBillModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const resolvedInitialCard = initialCardId && cards.some(c => c.id === initialCardId) ? initialCardId : (cards.length > 0 ? cards[0].id : null);
  const [selectedCardId, setSelectedCardId] = useState(resolvedInitialCard);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGINATION_LIMIT = 6;
  const totalPages = Math.ceil(cards.length / PAGINATION_LIMIT);
  const paginatedCards = cards.slice((currentPage - 1) * PAGINATION_LIMIT, currentPage * PAGINATION_LIMIT);

  const selectedCard = cards.find((c) => c.id === selectedCardId);


  const [invoiceDate, setInvoiceDate] = useState(new Date());
  
  const previousMonth = () => {
    setInvoiceDate(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setInvoiceDate(new Date(invoiceDate.getFullYear(), invoiceDate.getMonth() + 1, 1));
  };
  
  const invoiceMonthName = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(invoiceDate);

  const currentInvoiceTransactions = selectedCard?.transactions.filter(t => {
    const d = getInvoiceDateForTransaction(t, selectedCard);
    return d.getMonth() === invoiceDate.getMonth() && d.getFullYear() === invoiceDate.getFullYear();
  }) || [];

  const totalPurchases = currentInvoiceTransactions.reduce((acc, t) => acc + (t.direction === "DEBIT" ? Number(t.amount) : 0), 0);
  const totalPayments = currentInvoiceTransactions.reduce((acc, t) => acc + (t.direction === "CREDIT" ? Number(t.amount) : 0), 0);
  const invoiceSpent = Math.max(0, totalPurchases - totalPayments);
  
  const isPaidOut = totalPurchases > 0 && invoiceSpent <= 0;
  const isPartiallyPaid = totalPayments > 0 && invoiceSpent > 0;

  const isInvoiceClosed = (() => {
    if (!selectedCard) return false;
    const closingDay = selectedCard.billingDay || (selectedCard.dueDay ? selectedCard.dueDay - 7 : 1);
    const dueDay = selectedCard.dueDay || 1;
    
    const invMonth = invoiceDate.getMonth();
    const invYear = invoiceDate.getFullYear();
    
    const closeMonth = dueDay < closingDay ? invMonth - 1 : invMonth;
    const closedDate = new Date(invYear, closeMonth, closingDay);
    
    // To ignore time of day and just compare dates
    closedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return today.getTime() >= closedDate.getTime();
  })();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-2">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Cartões de Crédito</h1>
          <p className="text-zinc-400">Gerencie seus limites, faturas e gastos parcelados.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsCardModalOpen(true)}
            variant="outline"
            className="border-primary/30 text-primary hover:bg-primary/10 hover:text-primary rounded-xl font-bold h-11 px-6 transition-all duration-300 hover:border-primary/50 hover:scale-[1.03] active:scale-[0.98] group/btn2"
          >
            <Plus className="w-5 h-5 mr-2 transition-transform duration-300 group-hover/btn2:rotate-90" />
            Novo Cartão
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl font-bold h-11 px-7 shadow-[0_0_25px_rgba(57,255,20,0.25)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(57,255,20,0.45)] hover:scale-[1.03] active:scale-[0.98] group/btn"
          >
            <ShoppingCart className="w-5 h-5 mr-2 transition-transform duration-300 group-hover/btn:-translate-y-px" />
            Nova Compra
          </Button>
        </div>
      </div>

      <CardsSummary
        totalCreditLimit={summaryData.totalCreditLimit}
        totalCreditUsed={summaryData.totalCreditUsed}
        loanedFromCards={summaryData.loanedFromCards}
        cardsCount={summaryData.cardsCount}
      />

      {cards.length === 0 ? (
        <div className="bg-card/50 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <CreditCard className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold mb-2">Nenhum Cartão Encontrado</h2>
          <p className="text-zinc-500 mb-6 max-w-sm">Você não possui nenhum cartão de crédito configurado. Cadastre seu primeiro cartão para começar a gerenciar suas faturas.</p>
          <Button
            onClick={() => setIsCardModalOpen(true)}
            className="bg-primary text-zinc-950 hover:bg-primary/90 rounded-xl font-bold h-11 px-8 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-2" />
            Cadastrar Cartão
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedCards.map((card) => {
              const spent = card.transactions.reduce((acc: number, t: Transaction) => acc + (t.direction === "DEBIT" ? Number(t.amount) : -Number(t.amount)), 0);
              const limit = card.creditLimit ? Number(card.creditLimit) : 0;
              const isSelected = selectedCardId === card.id;

              const availableLimit = Math.max(0, limit - spent);

              return (
                <div
                  key={card.id}
                  onClick={() => setSelectedCardId(card.id)}
                  className={`relative p-6 rounded-3xl cursor-pointer overflow-hidden transition-all duration-300 border backdrop-blur-xl flex flex-col justify-between ${
                    isSelected
                      ? "bg-zinc-900 border-primary/50 shadow-[0_0_30px_rgba(57,255,20,0.1)] ring-1 ring-primary/20 scale-[1.02]"
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
                      <span className="text-zinc-400">Total Faturas</span>
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded-full border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm text-zinc-400">
                Página <span className="font-bold text-white">{currentPage}</span> de {totalPages}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded-full border-white/10 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {selectedCard && (
            <div className="bg-card border border-white/5 rounded-3xl p-6 md:p-8 mt-8 fade-in-up">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      Fatura <span className="text-primary">{selectedCard.name}</span>
                    </h3>
                    <Button
                       variant="ghost"
                       size="icon"
                       onClick={() => setIsEditModalOpen(true)}
                       title="Editar Cartão"
                       className="w-8 h-8 rounded-full text-zinc-500 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                  
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
                   <p className="text-sm font-medium text-zinc-400 mb-1">
                     {isPaidOut ? "Fatura Totalmente Paga" : "Total da Fatura"}
                   </p>
                   <p className={`text-3xl font-extrabold mb-3 ${isPaidOut ? "text-primary drop-shadow-[0_0_15px_rgba(57,255,20,0.3)]" : "text-white"}`}>
                     {formatCurrency(invoiceSpent)}
                   </p>
                   
                   {isPaidOut ? (
                     <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-primary tracking-wide uppercase">Paga</span>
                     </div>
                   ) : isInvoiceClosed ? (
                     <div className="flex flex-col items-end gap-2">
                       {isPartiallyPaid && (
                         <div className="text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-1 rounded-md mb-1">
                           Falta {formatCurrency(invoiceSpent)}
                         </div>
                       )}
                       <Button 
                          onClick={() => setIsPayBillModalOpen(true)}
                          size="sm"
                          className="bg-primary/20 text-primary hover:bg-primary/30 border border-primary/30 rounded-lg font-semibold shadow-none transition-all"
                       >
                          Pagar Fatura
                       </Button>
                     </div>
                   ) : (
                     <div className="flex flex-col items-end gap-2">
                       {isPartiallyPaid && (
                         <div className="text-xs font-semibold text-orange-400 bg-orange-400/10 border border-orange-400/20 px-2 py-1 rounded-md mb-1">
                           Pagamento Parcial Realizado
                         </div>
                       )}
                       <div className="px-3 py-1.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(57,255,20,0.6)] animate-pulse" />
                          <span className="text-[11px] font-bold text-zinc-400 tracking-wide uppercase">Fatura Aberta</span>
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
                  {currentInvoiceTransactions.map((t: Transaction) => {
                    const isPayment = t.type === "BILL_PAYMENT" || t.direction === "CREDIT";
                    
                    return (
                      <div key={t.id} className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
                        isPayment 
                          ? "bg-zinc-950/30 border-primary/10 hover:border-primary/30 hover:bg-zinc-900/40 hover:shadow-[0_0_20px_rgba(57,255,20,0.05)]" 
                          : "bg-zinc-950/30 border-white/5 hover:border-white/10 hover:bg-zinc-900/60"
                      }`}>
                        
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                            isPayment 
                              ? "bg-primary/20 text-primary shadow-[0_0_15px_rgba(57,255,20,0.15)]" 
                              : "bg-orange-500/10 text-orange-500"
                          }`}>
                            {isPayment ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <p className={`font-bold text-sm ${isPayment ? "text-primary" : "text-zinc-100"}`}>
                              {t.description}
                            </p>
                            <div className="flex items-center gap-3 text-[11px] font-medium text-zinc-500 uppercase tracking-widest">
                              <span>{formatDate(t.transactionDate)}</span>
                              {t.category && !isPayment && (
                                <span className="flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                  <Tag className="w-3 h-3 ml-1" />
                                  {t.category.name}
                                </span>
                              )}
                              {t.person && !isPayment && (
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
                          <span className={`font-black text-sm ${isPayment ? "text-primary" : ""}`}>
                            {isPayment ? "+" : ""}{formatCurrency(Number(t.amount))}
                          </span>
                          {t.installmentTotal && t.installmentTotal > 1 ? (
                             <Badge variant="outline" className="mt-1 py-0 text-[10px] border-white/10 text-zinc-400 bg-white/5">
                               {t.installmentNumber}/{t.installmentTotal}
                             </Badge>
                          ) : null}
                        </div>

                      </div>
                    );
                  })}
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

      <AddCreditCardModal
        open={isCardModalOpen}
        onOpenChange={setIsCardModalOpen}
      />

      {selectedCard && (
        <EditCreditCardModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          card={selectedCard}
        />
      )}

      {selectedCard && (
        <PayBillModal
          open={isPayBillModalOpen}
          onOpenChange={setIsPayBillModalOpen}
          cardId={selectedCard.id}
          cardName={selectedCard.name}
          suggestedAmount={invoiceSpent}
          defaultDate={new Date(invoiceDate.getFullYear(), invoiceDate.getMonth(), selectedCard.dueDay || 1)}
        />
      )}
    </div>
  );
}

import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, getDaysUntilDue } from "@/lib/format";
import type { CardInvoice } from "@/lib/billing";

interface PendingBillsListProps {
  invoices: CardInvoice[];
}

export function PendingBillsList({ invoices }: PendingBillsListProps) {
  return (
    <div className="bg-card border border-border/40 rounded-3xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg">Faturas dos Cartões</h3>
        {invoices.length > 0 && (
          <button className="text-sm text-primary font-medium hover:underline transition-colors focus-visible:ring-primary focus-visible:outline-none rounded">
            Ver Tudo
          </button>
        )}
      </div>

      {invoices.length === 0 ? <EmptyState /> : <InvoiceItems invoices={invoices} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center p-8 rounded-2xl bg-background/30 border border-dashed border-border/50">
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">Nenhuma fatura de cartão no mês atual.</p>
        <Button variant="outline" className="rounded-xl border-dashed border-border/60 text-muted-foreground hover:text-white transition-colors">
          Ir para Cartões
        </Button>
      </div>
    </div>
  );
}

function InvoiceItems({ invoices }: { invoices: CardInvoice[] }) {
  return (
    <div className="space-y-4">
      {invoices.map((invoice) => {
        const days = getDaysUntilDue(invoice.dueDate);
        const isCritical = days <= 3 && days >= 0;
        const isOverdue = days < 0;

        return (
          <div key={invoice.accountId} className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-border/20 hover:border-border/60 transition-colors">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isOverdue ? "bg-red-500/10 text-red-500" : isCritical ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary"
              }`}>
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{invoice.accountName}</p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
                  {invoice.last4 ? `•••• ${invoice.last4}` : "CARTÃO"} •{" "}
                  {isOverdue
                    ? `VENCEU HÁ ${Math.abs(days)} DIAS`
                    : days === 0
                    ? "VENCE HOJE"
                    : `VENCE EM ${days} DIAS`}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="font-bold text-sm whitespace-nowrap">{formatCurrency(invoice.totalAmount)}</span>
              {isOverdue ? (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-red-500 border-red-500/20 bg-red-500/10">
                  ATRASADA
                </Badge>
              ) : isCritical ? (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-orange-500 border-orange-500/20 bg-orange-500/10">
                  CRÍTICO
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 text-muted-foreground border-border bg-secondary/30">
                  ABERTA
                </Badge>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

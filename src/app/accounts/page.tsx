import { Plus, Wallet, Building2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Formata valores inteiros (centavos) para Real Brasileiro (BRL)
function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const mockAccounts = [
  {
    id: "1",
    name: "Conta Corrente Principal",
    institution: "Nubank",
    type: "CORRENTE",
    balance: 1250000, // R$ 12.500,00
    isDefault: true,
  },
  {
    id: "2",
    name: "Reserva de Emergência",
    institution: "Itaú",
    type: "POUPANCA",
    balance: 5000000, // R$ 50.000,00
    isDefault: false,
  },
  {
    id: "3",
    name: "Cartão de Crédito",
    institution: "C6 Bank",
    type: "CREDITO",
    balance: -145050, // - R$ 1.450,50
    isDefault: false,
  },
];

export default function AccountsPage() {
  const totalBalance = mockAccounts.reduce((acc, account) => acc + account.balance, 0);

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Minhas Contas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus saldos, cartões e contas bancárias.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">
          <Plus className="mr-2 h-4 w-4" /> Nova Conta
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Soma de todas as contas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockAccounts.map((account) => (
          <Card key={account.id} className="hover:border-primary/50 transition-colors">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {account.type === "CREDITO" ? (
                      <CreditCard className="h-4 w-4 text-blue-500" />
                    ) : (
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                    )}
                    {account.name}
                  </CardTitle>
                  <CardDescription>{account.institution}</CardDescription>
                </div>
                {account.isDefault && (
                  <Badge variant="outline" className="text-xs border-primary text-primary">
                    Principal
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-1">
                <span className="text-sm font-medium text-muted-foreground">
                  Saldo
                </span>
                <span
                  className={`text-2xl font-bold ${
                    account.balance < 0 ? "text-destructive" : "text-foreground"
                  }`}
                >
                  {formatCurrency(account.balance)}
                </span>
              </div>
            </CardContent>
            <CardFooter className="pt-4 border-t border-border/50">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                {account.type}
              </span>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

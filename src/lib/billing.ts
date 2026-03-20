interface BillingAccount {
  billingDay: number | null;
  dueDay: number | null;
}

interface BillingTransaction {
  transactionDate: Date;
  postingDate?: Date | null;
}

export function getInvoiceDateForTransaction(
  t: BillingTransaction,
  account: BillingAccount,
): Date {
  if (t.postingDate) return new Date(t.postingDate);

  const tDate = new Date(t.transactionDate);
  const closingDay = account.billingDay || (account.dueDay ? account.dueDay - 7 : 1);
  const dueDay = account.dueDay || 1;

  let baseMonthOffset = 0;
  if (tDate.getDate() >= closingDay) {
    baseMonthOffset = 1;
  }
  if (dueDay < closingDay) {
    baseMonthOffset += 1;
  }

  return new Date(
    tDate.getFullYear(),
    tDate.getMonth() + baseMonthOffset,
    dueDay,
    12,
    0,
    0,
  );
}

export interface CardInvoice {
  accountId: string;
  accountName: string;
  last4: string | null;
  dueDate: Date;
  totalAmount: number;
}

interface InvoiceAccount extends BillingAccount {
  id: string;
  name: string;
  last4: string | null;
  transactions: (BillingTransaction & { amount: unknown; direction: string })[];
}

export function computeCurrentInvoices(
  accounts: InvoiceAccount[],
  referenceDate: Date = new Date(),
): CardInvoice[] {
  const refMonth = referenceDate.getMonth();
  const refYear = referenceDate.getFullYear();

  const invoices: CardInvoice[] = [];

  for (const account of accounts) {
    const dueDay = account.dueDay || 1;

    let totalAmount = 0;
    let hasTransactions = false;

    for (const t of account.transactions) {
      const invoiceDate = getInvoiceDateForTransaction(t, account);

      if (invoiceDate.getMonth() === refMonth && invoiceDate.getFullYear() === refYear) {
        hasTransactions = true;
        const amount = Number(t.amount);
        totalAmount += t.direction === "DEBIT" ? amount : -amount;
      }
    }

    if (hasTransactions) {
      invoices.push({
        accountId: account.id,
        accountName: account.name,
        last4: account.last4,
        dueDate: new Date(refYear, refMonth, dueDay, 12, 0, 0),
        totalAmount,
      });
    }
  }

  return invoices;
}

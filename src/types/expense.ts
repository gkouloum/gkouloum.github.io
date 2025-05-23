
export type Expense = {
  id: number;
  owner: 'Makis' | 'Vicky';
  date: string;
  description: string;
  amount: number;
  comment: string | null;
  created_at: string;
};

export type ExpenseFormData = {
  owner: 'Makis' | 'Vicky';
  date: string;
  description: string;
  amount: number;
  comment?: string;
};

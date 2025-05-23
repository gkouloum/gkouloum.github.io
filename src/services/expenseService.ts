
import { supabase } from "@/integrations/supabase/client";
import { Expense, ExpenseFormData } from "@/types/expense";

export async function getRecentExpenses(limit: number = 20): Promise<Expense[]> {
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching expenses:', error);
    throw new Error(error.message);
  }
  
  // Cast the data to ensure the owner field matches the expected type
  return (data as unknown as Expense[]) || [];
}

export async function getExpensesByDateRange(startDate: string, endDate?: string): Promise<Expense[]> {
  let query = supabase
    .from('expenses')
    .select('*')
    .gte('date', startDate);
  
  if (endDate) {
    query = query.lte('date', endDate);
  }
  
  const { data, error } = await query.order('date', { ascending: false });
  
  if (error) {
    console.error('Error fetching expenses by date range:', error);
    throw new Error(error.message);
  }
  
  // Cast the data to ensure the owner field matches the expected type
  return (data as unknown as Expense[]) || [];
}

export async function addExpense(expense: ExpenseFormData): Promise<Expense> {
  const { data, error } = await supabase
    .from('expenses')
    .insert(expense)
    .select()
    .single();
  
  if (error) {
    console.error('Error adding expense:', error);
    throw new Error(error.message);
  }
  
  // Cast the data to ensure the owner field matches the expected type
  return data as unknown as Expense;
}

export async function deleteExpense(id: number): Promise<void> {
  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting expense:', error);
    throw new Error(error.message);
  }
}

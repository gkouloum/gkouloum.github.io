
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Expense } from "@/types/expense";
import { getRecentExpenses, getExpensesByDateRange, deleteExpense } from "@/services/expenseService";
import { toast } from "sonner";
import { PlusCircle, Trash2, Calendar, Filter } from "lucide-react";
import { format, parseISO } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<string>("");
  const [totalAmount, setTotalAmount] = useState(0);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EU', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      let data: Expense[];
      
      if (startDate) {
        data = await getExpensesByDateRange(startDate, endDate || undefined);
      } else {
        data = await getRecentExpenses();
      }
      
      // Filter by owner if selected
      if (selectedOwner) {
        data = data.filter(expense => expense.owner === selectedOwner);
      }
      
      setExpenses(data);
      
      // Calculate total
      const sum = data.reduce((acc, expense) => acc + expense.amount, 0);
      setTotalAmount(sum);
    } catch (error) {
      toast.error("Failed to load expenses");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadExpenses();
  }, []);
  
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense(id);
        setExpenses(expenses.filter(expense => expense.id !== id));
        toast.success("Expense deleted successfully");
        
        // Recalculate total
        const sum = expenses
          .filter(expense => expense.id !== id)
          .reduce((acc, expense) => acc + expense.amount, 0);
        setTotalAmount(sum);
      } catch (error) {
        toast.error("Failed to delete expense");
        console.error(error);
      }
    }
  };
  
  const handleFilter = () => {
    loadExpenses();
  };
  
  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setSelectedOwner("");
    loadExpenses();
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">Common Family Expenses</h1>
        <Button 
          onClick={() => navigate("/add")} 
          className="flex items-center"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" /> Filter Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                From Date
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                To Date
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                Owner
              </label>
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger>
                  <SelectValue placeholder="All owners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All owners</SelectItem>
                  <SelectItem value="Makis">Makis</SelectItem>
                  <SelectItem value="Vicky">Vicky</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end space-x-2">
              <Button onClick={handleFilter}>Apply Filter</Button>
              <Button variant="outline" onClick={clearFilters}>Clear</Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Recent Expenses</span>
            <span className="text-lg">
              Total: {formatCurrency(totalAmount)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-4">No expenses found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">ID</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Comment</TableHead>
                    <TableHead className="w-16 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{expense.id}</TableCell>
                      <TableCell>{expense.owner}</TableCell>
                      <TableCell>{formatDate(expense.date)}</TableCell>
                      <TableCell>{expense.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {expense.comment || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          title="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseList;

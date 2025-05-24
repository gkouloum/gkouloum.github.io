
import { useEffect, useState } from "react";
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
import { PlusCircle, Trash2, Calendar, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const ExpenseList = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<string>("all");
  const [makisTotal, setMakisTotal] = useState(0);
  const [vickyTotal, setVickyTotal] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
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
      if (selectedOwner && selectedOwner !== "all") {
        data = data.filter(expense => expense.owner === selectedOwner);
      }
      
      setExpenses(data);
      
      // Calculate separate totals for Makis and Vicky
      const makisSum = data
        .filter(expense => expense.owner === "Makis")
        .reduce((acc, expense) => acc + expense.amount, 0);
      const vickySum = data
        .filter(expense => expense.owner === "Vicky")
        .reduce((acc, expense) => acc + expense.amount, 0);
      
      setMakisTotal(makisSum);
      setVickyTotal(vickySum);
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
        const updatedExpenses = expenses.filter(expense => expense.id !== id);
        setExpenses(updatedExpenses);
        toast.success("Expense deleted successfully");
        
        // Recalculate totals
        const makisSum = updatedExpenses
          .filter(expense => expense.owner === "Makis")
          .reduce((acc, expense) => acc + expense.amount, 0);
        const vickySum = updatedExpenses
          .filter(expense => expense.owner === "Vicky")
          .reduce((acc, expense) => acc + expense.amount, 0);
        
        setMakisTotal(makisSum);
        setVickyTotal(vickySum);
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
    setSelectedOwner("all");
    loadExpenses();
  };
  
  const handleAddClick = () => {
    window.location.href = "/add";
  };
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Family Expenses</h1>
        <p className="text-gray-600">Track and manage your family's common expenses</p>
      </div>
      
      {/* Collapsible Filter Section */}
      <Card className="border-2">
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <CardTitle className="text-lg flex items-center justify-between">
                <div className="flex items-center">
                  <Filter className="mr-2 h-5 w-5" />
                  Filter & Search
                </div>
                {isFilterOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    From Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    To Date
                  </label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Owner
                  </label>
                  <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="All owners" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All owners</SelectItem>
                      <SelectItem value="Makis">Makis</SelectItem>
                      <SelectItem value="Vicky">Vicky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end space-x-2">
                  <Button onClick={handleFilter} className="flex-1">
                    Apply
                  </Button>
                  <Button variant="outline" onClick={clearFilters} className="flex-1">
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {/* Expenses Table */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-xl">Recent Expenses</span>
            <div className="flex gap-6">
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(makisTotal)}
                </div>
                <div className="text-xs text-gray-500">Makis Total</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-purple-600">
                  {formatCurrency(vickyTotal)}
                </div>
                <div className="text-xs text-gray-500">Vicky Total</div>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading expenses...</p>
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
              <p className="text-gray-600">Start by adding your first expense</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-xs">ID</TableHead>
                    <TableHead className="text-xs">Owner</TableHead>
                    <TableHead className="text-xs">Date</TableHead>
                    <TableHead className="text-xs">Description</TableHead>
                    <TableHead className="text-right text-xs">Amount</TableHead>
                    <TableHead className="text-xs">Comment</TableHead>
                    <TableHead className="w-12 text-right text-xs">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <TableRow key={expense.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-xs py-2">{expense.id}</TableCell>
                      <TableCell className="py-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          expense.owner === 'Makis' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {expense.owner}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs py-2">{formatDate(expense.date)}</TableCell>
                      <TableCell className="font-medium text-xs py-2">{expense.description}</TableCell>
                      <TableCell className="text-right font-bold text-green-600 text-xs py-2">
                        {formatCurrency(expense.amount)}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-gray-600 text-xs py-2">
                        {expense.comment || '-'}
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                          title="Delete expense"
                          className="hover:bg-red-50 hover:text-red-600 h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
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
      
      {/* Add Expense Button - Fixed at bottom */}
      <div className="fixed bottom-6 right-6">
        <Button 
          onClick={handleAddClick} 
          size="lg"
          className="shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700 rounded-full h-14 w-14 md:h-auto md:w-auto md:rounded-md md:px-6"
        >
          <PlusCircle className="h-6 w-6 md:mr-2" />
          <span className="hidden md:inline">Add Expense</span>
        </Button>
      </div>
    </div>
  );
};

export default ExpenseList;

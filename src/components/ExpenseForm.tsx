
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { addExpense } from "@/services/expenseService";
import { ExpenseFormData } from "@/types/expense";
import { toast } from "sonner";

const ExpenseForm = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    owner: 'Makis',
    date: today,
    description: '',
    amount: 0,
    comment: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and decimal point
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setFormData((prev) => ({ ...prev, amount: parseFloat(value) || 0 }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return;
    }
    
    if (formData.amount <= 0) {
      toast.error("Amount must be greater than zero");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await addExpense(formData);
      toast.success("Expense added successfully");
      navigate("/");
    } catch (error) {
      toast.error("Error adding expense");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Add New Expense</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Select 
              value={formData.owner} 
              onValueChange={(value) => handleSelectChange('owner', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select owner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Makis">Makis</SelectItem>
                <SelectItem value="Vicky">Vicky</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What was this expense for?"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (€)</Label>
            <Input
              id="amount"
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              value={formData.amount || ''}
              onChange={handleAmountChange}
              placeholder="0.00"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="comment">Comment (Optional)</Label>
            <Textarea
              id="comment"
              name="comment"
              value={formData.comment || ''}
              onChange={handleChange}
              placeholder="Add any additional details..."
              rows={3}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Expense"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ExpenseForm;

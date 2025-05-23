
import ExpenseForm from "@/components/ExpenseForm";

const AddExpensePage = () => {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Add New Expense</h1>
      <ExpenseForm />
    </div>
  );
};

export default AddExpensePage;

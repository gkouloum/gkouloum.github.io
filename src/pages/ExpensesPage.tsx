
import { useNavigate } from "react-router-dom";
import ExpenseList from "@/components/ExpenseList";

const ExpensesPage = () => {
  // This component exists within the Router context from App.tsx
  const navigate = useNavigate();
  
  // Handle navigation actions that ExpenseList needs
  const handleAddExpense = () => {
    navigate('/add');
  };
  
  return (
    <>
      <ExpenseList />
    </>
  );
};

export default ExpensesPage;

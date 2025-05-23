
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // This component is not needed anymore, redirecting to the main expenses page
    navigate("/");
  }, [navigate]);
  
  return null;
};

export default Index;

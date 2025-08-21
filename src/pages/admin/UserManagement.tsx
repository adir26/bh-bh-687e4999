// Redirect to CustomerManagement - this component is deprecated
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the new CustomerManagement page
    navigate('/admin/customers', { replace: true });
  }, [navigate]);

  return null;
}
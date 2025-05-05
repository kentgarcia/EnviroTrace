import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the sign-in page
    navigate({ to: "/" });
  }, [navigate]);

  return null;
};

export default Index;

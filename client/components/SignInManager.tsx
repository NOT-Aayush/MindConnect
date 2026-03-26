import { useEffect, useState } from "react";
import SignInModal from "./SignInModal";
import { useAuth } from "@/context/AuthContext";

export default function SignInManager() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("mc_seen_modal");
    if (!seen && !user) {
      setOpen(true);
    }
  }, [user]);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener('mc:open-signin', onOpen as EventListener);
    return () => window.removeEventListener('mc:open-signin', onOpen as EventListener);
  }, []);

  return <SignInModal open={open && !user} onClose={() => setOpen(false)} />;
}

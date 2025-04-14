"use client";

import { useState } from "react";
import { useSessionStore } from "@/stores/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * AccountSetter component
 * 
 * Allows setting a mock account for demonstration purposes.
 * In a real application, this would typically be done when a user logs in.
 */
export function AccountSetter() {
  const [pubkeyInput, setPubkeyInput] = useState("");
  const setCurrentAccount = useSessionStore((state) => state.setCurrentAccount);

  const handleSetAccount = () => {
    if (pubkeyInput.trim()) {
      setCurrentAccount({ pubkey: pubkeyInput });
    }
  };

  const handleClearAccount = () => {
    setCurrentAccount(null);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-semibold mb-2">Set Account</h2>
      <div className="flex gap-2 mb-2">
        <Input
          placeholder="Enter pubkey"
          value={pubkeyInput}
          onChange={(e) => setPubkeyInput(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleSetAccount}>Set</Button>
      </div>
      <Button variant="outline" onClick={handleClearAccount}>
        Clear Account
      </Button>
    </div>
  );
}
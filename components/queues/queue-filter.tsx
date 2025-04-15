"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, PlusIcon } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { apiGet } from "@/lib/api";
import { NewQueueDialog } from "@/components/new-queue-dialog";

interface Queue {
  id: string;
  name: string;
  description?: string;
}

interface QueueFilterProps {
  accountPubkey?: string | null;
  onQueueChange?: (queueId: string | null) => void;
  className?: string;
}

export function QueueFilter({ accountPubkey, onQueueChange, className }: QueueFilterProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<string | null>(null);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNewQueueDialogOpen, setIsNewQueueDialogOpen] = useState(false);

  // Fetch queues when accountPubkey changes
  useEffect(() => {
    async function fetchQueues() {
      if (!accountPubkey) return;
      
      setIsLoading(true);
      try {
        const response = await apiGet(`/api/queues?accountPubkey=${accountPubkey}`);
        if (response.queues) {
          setQueues(response.queues);
        }
      } catch (error) {
        console.error("Error fetching queues:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQueues();
  }, [accountPubkey]);

  // Handle queue selection
  const handleSelect = (currentValue: string | null) => {
    if (currentValue === "new") {
      setIsNewQueueDialogOpen(true);
      setOpen(false);
      return;
    }

    const newValue = currentValue === value ? null : currentValue;
    setValue(newValue);
    setOpen(false);
    
    if (onQueueChange) {
      onQueueChange(newValue);
    }
  };

  // Get the selected queue name
  const getSelectedQueueName = () => {
    if (!value) return "All queues";
    const selectedQueue = queues.find(queue => queue.id === value);
    return selectedQueue ? selectedQueue.name : "All queues";
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            // This is a shadcn/ui pattern
            role="combobox"
            aria-expanded={open}
            className={cn("justify-between", className)}
          >
            {isLoading ? "Loading queues..." : getSelectedQueueName()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search queue..." />
            <CommandList>
              <CommandEmpty>No queue found.</CommandEmpty>
              <CommandGroup>
                <CommandItem
                  value="all"
                  onSelect={() => handleSelect(null)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      !value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  All queues
                </CommandItem>
                
                {queues.map((queue) => (
                  <CommandItem
                    key={queue.id}
                    value={queue.id}
                    onSelect={() => handleSelect(queue.id)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === queue.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {queue.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              
              <CommandSeparator />
              
              <CommandGroup>
                <CommandItem
                  value="new"
                  onSelect={() => handleSelect("new")}
                  className="text-primary"
                >
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Queue
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <NewQueueDialog 
        open={isNewQueueDialogOpen} 
        onOpenChange={setIsNewQueueDialogOpen} 
      />
    </>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const queues = [
    {
        value: "all",
        label: "All Queues",
    },
    {
        value: "default",
        label: "Default Queue",
    },
    {
        value: "important",
        label: "Important",
    },
    {
        value: "evergreen",
        label: "Evergreen Content",
    },
];

export function QueueSelector() {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("all");

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
                    {value ? queues.find((queue) => queue.value === value)?.label : "Select queue..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
                <Command>
                    <CommandInput placeholder="Search queue..." />
                    <CommandList>
                        <CommandEmpty>No queue found.</CommandEmpty>
                        <CommandGroup>
                            {queues.map((queue) => (
                                <CommandItem
                                    key={queue.value}
                                    value={queue.value}
                                    onSelect={(currentValue) => {
                                        setValue(currentValue === value ? "" : currentValue);
                                        setOpen(false);
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            value === queue.value ? "opacity-100" : "opacity-0",
                                        )}
                                    />
                                    {queue.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

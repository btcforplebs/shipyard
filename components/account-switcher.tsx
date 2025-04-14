"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon, PlusCircledIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Account = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

const accounts: Account[] = [
    {
        label: "Personal",
        value: "personal",
        icon: (
            <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="Personal" />
                <AvatarFallback>P</AvatarFallback>
            </Avatar>
        ),
    },
    {
        label: "Work",
        value: "work",
        icon: (
            <Avatar className="h-6 w-6">
                <AvatarImage src="/placeholder-user.jpg" alt="Work" />
                <AvatarFallback>W</AvatarFallback>
            </Avatar>
        ),
    },
];

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>;

interface AccountSwitcherProps extends PopoverTriggerProps {}

export function AccountSwitcher({ className }: AccountSwitcherProps) {
    const [open, setOpen] = React.useState(false);
    const [showNewAccountDialog, setShowNewAccountDialog] = React.useState(false);
    const [selectedAccount, setSelectedAccount] = React.useState<Account>(accounts[0]);

    return (
        <Dialog open={showNewAccountDialog} onOpenChange={setShowNewAccountDialog}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-label="Select an account"
                        className={cn("w-[200px] justify-between", className)}
                    >
                        {selectedAccount.icon}
                        <span className="ml-2">{selectedAccount.label}</span>
                        <CaretSortIcon className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandList>
                            <CommandInput placeholder="Search account..." />
                            <CommandEmpty>No account found.</CommandEmpty>
                            <CommandGroup heading="Accounts">
                                {accounts.map((account) => (
                                    <CommandItem
                                        key={account.value}
                                        onSelect={() => {
                                            setSelectedAccount(account);
                                            setOpen(false);
                                        }}
                                        className="text-sm"
                                    >
                                        {account.icon}
                                        <span className="ml-2">{account.label}</span>
                                        <CheckIcon
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                selectedAccount.value === account.value ? "opacity-100" : "opacity-0",
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
                        <CommandList>
                            <CommandGroup>
                                <DialogTrigger asChild>
                                    <CommandItem
                                        onSelect={() => {
                                            setOpen(false);
                                            setShowNewAccountDialog(true);
                                        }}
                                    >
                                        <PlusCircledIcon className="mr-2 h-5 w-5" />
                                        Add Account
                                    </CommandItem>
                                </DialogTrigger>
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Account</DialogTitle>
                    <DialogDescription>Add a new Nostr account to Shipyard.</DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="nsec">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="nsec">Private Key</TabsTrigger>
                        <TabsTrigger value="remote">Remote Signer</TabsTrigger>
                    </TabsList>
                    <TabsContent value="nsec" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Account name</Label>
                            <Input id="name" placeholder="Personal" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nsec">Private key (nsec)</Label>
                            <Input id="nsec" type="password" placeholder="nsec1..." />
                            <p className="text-xs text-muted-foreground">
                                Your private key will be encrypted and stored securely on this device.
                            </p>
                        </div>
                    </TabsContent>
                    <TabsContent value="remote" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="remote-name">Account name</Label>
                            <Input id="remote-name" placeholder="Personal" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="connection-string">Connection string</Label>
                            <Textarea id="connection-string" placeholder="bunker://..." className="min-h-[80px]" />
                            <p className="text-xs text-muted-foreground">
                                Enter the connection string provided by your nsecBunker or other remote signer.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setShowNewAccountDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={() => setShowNewAccountDialog(false)}>Add Account</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

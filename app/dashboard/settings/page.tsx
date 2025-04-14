import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettings } from "@/components/account-settings";
import { SubscriptionSettings } from "@/components/subscription-settings";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Settings</h1>
            </div>

            <Tabs defaultValue="account">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="subscription">Subscription</TabsTrigger>
                </TabsList>
                <TabsContent value="account" className="mt-4">
                    <AccountSettings />
                </TabsContent>
                <TabsContent value="subscription" className="mt-4">
                    <SubscriptionSettings />
                </TabsContent>
            </Tabs>
        </div>
    );
}

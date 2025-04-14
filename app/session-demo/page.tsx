"use client";

import { AccountDisplay } from "@/components/account-display";
import { AccountSetter } from "@/components/account-setter";

/**
 * SessionDemo page
 *
 * Demonstrates how to use the session store with the AccountDisplay and AccountSetter components.
 */
export default function SessionDemo() {
    return (
        <div className="container mx-auto py-8">
            <h1 className="text-2xl font-bold mb-6">Session Store Demo</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AccountDisplay />
                <AccountSetter />
            </div>
            <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <h2 className="text-lg font-semibold mb-2">Usage Instructions</h2>
                <p className="mb-2">
                    This demo shows how to use the Zustand session store to manage the current account.
                </p>
                <p className="mb-2">
                    Enter a pubkey in the input field and click &quot;Set&quot; to set the current account. The account
                    display component will update to show the pubkey.
                </p>
                <p>
                    Click &quot;Clear Account&quot; to set the current account to null. The account display component
                    will update to show &quot;No account selected&quot;.
                </p>
            </div>
        </div>
    );
}

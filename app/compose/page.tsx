import { redirect } from "next/navigation";

export default function ComposePage() {
    // Redirect to login instead of dashboard for unauthenticated users
    redirect("/login");
}

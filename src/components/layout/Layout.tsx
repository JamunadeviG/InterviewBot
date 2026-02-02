import { Navbar } from "./Navbar";
import { Outlet } from "react-router-dom";

export function Layout() {
    return (
        <div className="min-h-screen bg-background font-sans antialiased text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <footer className="border-t py-6 md:py-0">
                <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
                    <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                        Built by Antigravity. The source code is available on Request.
                    </p>
                </div>
            </footer>
        </div>
    );
}

import { Button } from "@/components/ui/button";
import Header from "@/components/shared/header";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col gap-4">
          <Button size="lg" className="w-48" asChild>
            <Link href="/complaint/new">
              Customer Login
            </Link>
          </Button>
          <Button size="lg" variant="outline" className="w-48" asChild>
            <Link href="/csr">
              CSR Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

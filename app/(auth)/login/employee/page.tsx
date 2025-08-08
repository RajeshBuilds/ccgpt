import { EmployeeLoginForm } from "../../_components/employee-login-form";
import Header from "@/components/shared/header";

export default function EmployeeLoginPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <div className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm flex-col gap-6">
          <EmployeeLoginForm />
        </div>
      </div>
    </div>
  );
}

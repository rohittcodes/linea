import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Check your email</CardTitle>
          <CardDescription>
            We've sent you a magic link to sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-blue-50 p-4">
            <div className="text-sm text-blue-700">
              Click the link in your email to sign in. You can close this tab.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

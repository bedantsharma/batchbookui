import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";

export function PhoneLogin({ onContinue, isLoading }) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (/^[6-9]\d{9}$/.test(phoneNumber)) {
      onContinue(phoneNumber);
    }
  };

  const handlePhoneChange = (e) => {
    // Only allow digits and limit to 10
    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(val);
  };

  const isInvalid = phoneNumber.length > 0 && !/^[6-9]\d{9}$/.test(phoneNumber);

  return (
    <div className="modern-card animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Welcome</h1>
        <p className="text-muted-foreground">Enter your phone number to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-white/70 ml-1">
            Phone Number
          </Label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
              <span className="text-white/40 font-medium">+91</span>
              <div className="h-4 w-px bg-white/10" />
            </div>
            <Input
              id="phone"
              type="text"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="00000 00000"
              value={phoneNumber}
              onChange={handlePhoneChange}
              required
              className={`pl-16 h-12 bg-white/5 border-white/10 text-lg transition-all focus:bg-white/10 focus:ring-primary/20 focus:border-primary/50 ${
                isInvalid ? "border-destructive/50 focus:border-destructive" : ""
              }`}
              autoFocus
            />
          </div>
          {isInvalid && (
            <p className="text-xs text-destructive mt-1 ml-1 animate-in fade-in">
              Please enter a valid 10-digit mobile number
            </p>
          )}
        </div>

        <Button 
          className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
          type="submit"
          disabled={phoneNumber.length !== 10 || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              Sending...
            </div>
          ) : (
            "Get OTP"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground px-4 leading-relaxed">
          By continuing, you agree to our <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

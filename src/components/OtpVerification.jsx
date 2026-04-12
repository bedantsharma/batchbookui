import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

export function OtpVerification({ phoneNumber, onBack, onVerify, isLoading }) {
  const [otp, setOtp] = useState("");

  const handleVerify = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      onVerify(otp);
    }
  };

  return (
    <div className="modern-card animate-in fade-in slide-in-from-right-4 duration-500">
      <button
        onClick={onBack}
        className="absolute left-6 top-8 p-1 rounded-full hover:bg-white/5 transition-colors group"
      >
        <ArrowLeft className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
      </button>

      <div className="space-y-2 mb-8 text-center pt-2">
        <h1 className="text-2xl font-bold tracking-tight gradient-text">Verify</h1>
        <p className="text-muted-foreground">
          Code sent to <span className="text-white">+91 {phoneNumber}</span>
        </p>
      </div>

      <form onSubmit={handleVerify} className="space-y-8">
        <div className="flex justify-center">
          <InputOTP
            maxLength={6}
            value={otp}
            onChange={setOtp}
            autoFocus
            className="gap-2"
          >
            <InputOTPGroup className="gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className="w-10 h-12 bg-white/5 border-white/10 text-lg rounded-lg focus:border-primary/50"
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>

        <Button 
          className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
          type="submit"
          disabled={otp.length !== 6 || isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Spinner />
              Verifying...
            </div>
          ) : (
            "Verify & Sign In"
          )}
        </Button>
      </form>

      <div className="mt-10 text-center">
        <p className="text-sm text-muted-foreground">
          Didn't receive the code?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
            onClick={() => alert("OTP Resent!")}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
}

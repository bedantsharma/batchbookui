import { useState } from 'react'
import { PhoneLogin } from './components/PhoneLogin'
import { OtpVerification } from './components/OtpVerification'
import { Icons } from './components/ui/icons'

function App() {
  const [step, setStep] = useState('phone') // 'phone' | 'otp' | 'home'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // MOCK API CALLS
  const handlePhoneContinue = async (number) => {
    setIsLoading(true)
    console.log('API CALL: Sending OTP to', number)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setPhoneNumber(number)
    setStep('otp')
    setIsLoading(false)
  }

  const handleOtpVerify = async (otp) => {
    setIsLoading(true)
    console.log('API CALL: Verifying OTP', otp, 'for', phoneNumber)
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setStep('home')
    setIsLoading(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background selection:bg-primary/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-sm relative z-10">
        {step === 'phone' && (
          <PhoneLogin onContinue={handlePhoneContinue} isLoading={isLoading} />
        )}
        
        {step === 'otp' && (
          <OtpVerification 
            phoneNumber={phoneNumber} 
            onBack={() => setStep('phone')} 
            onVerify={handleOtpVerify} 
            isLoading={isLoading}
          />
        )}

        {step === 'home' && (
          <div className="modern-card text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.Check className="w-10 h-10 text-primary" strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Success!</h1>
            <p className="mt-3 text-muted-foreground">
              Logged in as <span className="text-white font-medium">+91 {phoneNumber}</span>
            </p>
            <div className="mt-10 pt-6 border-t border-white/5">
              <button 
                onClick={() => setStep('phone')}
                className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App

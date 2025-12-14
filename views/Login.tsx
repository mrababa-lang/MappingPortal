import React, { useState } from 'react';
import { AuthService } from '../services/authService';
import { Button, Input } from '../components/UI';
import { ArrowRight, Lock, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await AuthService.login(email, password);
      
      if (!user) {
        throw new Error("Received empty user data");
      }

      const welcomeName = (user && user.fullName) ? user.fullName : 'User';
      toast.success(`Welcome back, ${welcomeName}`);
      
      navigate('/dashboard');
    } catch (error: any) {
      console.error("Login Error", error);
      toast.error(error.message || "Invalid credentials or server error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Column: Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 relative items-center justify-center overflow-hidden">
         {/* Abstract geometric shapes */}
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-800 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/4"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slash-red rounded-full mix-blend-multiply filter blur-3xl opacity-10 translate-y-1/3 -translate-x-1/4"></div>
         
         <div className="relative z-10 p-12 text-white max-w-lg">
            <div className="w-16 h-16 bg-slash-red flex items-center justify-center rounded-lg mb-8 shadow-2xl shadow-rose-900/50">
               <span className="text-4xl font-bold">S/</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6">Master Your<br/>Vehicle Data.</h1>
            <p className="text-slate-400 text-lg leading-relaxed">
               The premium portal for managing SlashData's vehicle configurations. 
               Streamline your mappings, leverage AI insights, and maintain data integrity with ease.
            </p>
         </div>
      </div>

      {/* Right Column: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="text-center lg:text-left">
             <div className="inline-flex lg:hidden w-12 h-12 bg-slash-red items-center justify-center rounded-lg mb-6 shadow-lg text-white font-bold text-xl">S/</div>
             <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Sign in to Portal</h2>
             <p className="text-slate-500 mt-2">Enter your credentials to access the workspace.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute top-9 left-3 text-slate-400 group-focus-within:text-slash-red transition-colors" size={18} />
                <Input 
                  label="Email Address" 
                  type="email" 
                  placeholder="name@slashdata.ae"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute top-9 left-3 text-slate-400 group-focus-within:text-slash-red transition-colors" size={18} />
                <Input 
                  label="Password" 
                  type="password" 
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
               <div className="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-slash-red focus:ring-slash-red border-slate-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600">Remember me</label>
               </div>
               <div className="text-sm">
                  <a href="#" className="font-medium text-slash-red hover:text-rose-700">Forgot password?</a>
               </div>
            </div>

            <Button 
              type="submit" 
              className="w-full py-3 text-base bg-slash-red hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all hover:scale-[1.01]" 
              isLoading={isLoading}
            >
              Sign In <ArrowRight size={18} />
            </Button>
          </form>

          <p className="text-center text-xs text-slate-400 mt-8">
            &copy; {new Date().getFullYear()} SlashData. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
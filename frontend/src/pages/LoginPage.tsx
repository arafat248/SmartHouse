import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useLoginMutation } from '../features/auth/authApi';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../features/auth/authSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const authData = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: authData.user, token: authData.access, refreshToken: authData.refresh }));
      navigate(from, { replace: true });
    } catch (err: any) {
      alert(err.data?.detail || 'Failed to login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-extrabold text-slate-900">Welcome Back</CardTitle>
          <p className="mt-2 text-sm text-slate-600">
            Please sign in to your account
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
            <Input 
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button type="submit" isLoading={isLoading} className="w-full justify-center">
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm">
            <span className="text-slate-600">Don't have an account? </span>
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Register here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

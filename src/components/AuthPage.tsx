import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import comp from '../assets/IOTIQEdge.png';
import './AuthPage.css';

type Props = {
  onAuthSuccess: () => void;
};

const AuthPage: React.FC<Props> = ({ onAuthSuccess }) => {
  const [loginForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      setProgress(0);

      // Step 1: Authenticate (30%)
      setProgress(30);
      await login({ email, password });
      
      // Step 2: Auth successful (60%)
      setProgress(60);
      message.success('Login successful');
      
      // Step 3: Prepare dashboard (80%)
      setProgress(80);
      
      // Small delay to ensure auth is stored
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Step 4: Navigate (100%)
      setProgress(100);
      onAuthSuccess();
      
    } catch (error: any) {
      message.error(error.message || 'Login failed');
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-content">
          <div className="auth-header">
            <div className="auth-logo">
              <img src={comp} alt="Logo" />
            </div>
          </div>

          <Form
            form={loginForm}
            onFinish={({ email, password }) => handleLogin(email, password)}
            layout="vertical"
            requiredMark={false}
          >
            {/* Email */}
            <Form.Item
              label={<span className="auth-label">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: 'Please enter your email' },
                { type: 'email', message: 'Please enter a valid email' },
              ]}
            >
              <div className="input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="auth-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 
                  2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 
                  4-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
                <Input
                  placeholder="you@company.com"
                  size="large"
                  className="auth-input"
                  bordered={false}
                  disabled={loading}
                />
              </div>
            </Form.Item>

            {/* Password */}
            <Form.Item
              label={<span className="auth-label">Password</span>}
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <div className="input-wrapper">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="auth-icon"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17a2 2 0 0 0 2-2v-2a2 2 0 
                  0 0-2-2 2 2 0 0 0-2 2v2a2 2 0 0 0 
                  2 2zm6-8h-1V7a5 5 0 0 0-10 
                  0v2H6c-1.1 0-2 .9-2 2v9c0 1.1.9 
                  2 2 2h12c1.1 0 2-.9 
                  2-2v-9c0-1.1-.9-2-2-2zm-6-4a3 
                  3 0 0 1 3 3v2H9V8a3 3 0 0 
                  1 3-3z" />
                </svg>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="auth-input native-input"
                  disabled={loading}
                />
                <div
                  className={`eye-toggle ${showPassword ? 'open' : ''}`}
                  onClick={togglePasswordVisibility}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.6}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={
                        showPassword
                          ? 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-.747 2.478-2.53 4.54-4.958 5.753M15 15l3 3M9 9l-3-3'
                          : 'M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      }
                    />
                  </svg>
                </div>
              </div>
            </Form.Item>

            <div className="auth-forgot">
              <a href="#">Forgot password?</a>
            </div>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                block
                className="auth-button"
              >
                {loading ? `Signing In... ${progress}%` : 'Sign In'}
              </Button>
            </Form.Item>

            {/* Progress Bar */}
            {loading && (
              <div style={{ marginTop: '16px' }}>
                <div style={{
                  width: '100%',
                  height: '4px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    backgroundColor: '#1890ff',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{
                  textAlign: 'center',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  {progress < 30 && 'Authenticating...'}
                  {progress >= 30 && progress < 60 && 'Verifying credentials...'}
                  {progress >= 60 && progress < 80 && 'Setting up session...'}
                  {progress >= 80 && 'Loading dashboard...'}
                </div>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
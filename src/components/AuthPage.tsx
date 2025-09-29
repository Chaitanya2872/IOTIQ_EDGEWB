import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  UserOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import '../App.css';
import './AuthPage.css';
import facility from '../assets/facility.png';
import iotiq from '../assets/iotiq.png';
import logo from '../assets/logo.png';
import { signIn, signUp, storeAuth } from '../api/auth';

const { Option } = Select;

type Props = {
  onAuthSuccess: () => void;
};

const SimpleAuthPage: React.FC<Props> = ({ onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSwap = () => {
    setIsLoginMode(!isLoginMode);
  };

  const handleLogin = async (values: any) => {
    try {
      setLoading(true);
      const res = await signIn({
        email: values.email,
        password: values.password,
      });
      storeAuth(res);
      message.success('Login successful');
      onAuthSuccess();
    } catch (err: any) {
      message.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    try {
      setLoading(true);
      const res = await signUp({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        roles: values.roles || ['USER'],
      });
      storeAuth(res);
      message.success('Registration successful');
      onAuthSuccess();
    } catch (err: any) {
      message.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="simple-auth-container">
      {/* Header */}
      <div className="simple-auth-header">
        <img src={facility} alt="SmartEdgeFM" />
        <img src={iotiq} alt="IOTIQ" />
      </div>

      {/* Main Content */}
      <div className={`simple-auth-content ${isLoginMode ? 'login-mode' : 'register-mode'}`}>
        
        {/* Left Section */}
        <div className="auth-left-section">
          <div className="left-content">
            {isLoginMode ? (
              // Login Form
              <div className="form-wrapper">
                <img src={logo} alt="Bristol Myers Squibb" className="form-logo" />
                <h2>Welcome Back!</h2>
                <p>Please login to your account</p>
                
                <Form
                  form={loginForm}
                  onFinish={handleLogin}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="Email Address"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[{ required: true, message: 'Please enter your password' }]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Password"
                      size="large"
                      iconRender={(visible: boolean) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      size="large"
                      block
                    >
                      LOGIN
                    </Button>
                  </Form.Item>
                  
                  <div className="form-links">
                    <a href="#">Forgot Password?</a>
                  </div>
                </Form>
              </div>
            ) : (
              // Switch Panel for Register Mode
              <div className="switch-panel">
                <h2>One of us?</h2>
                <p>If you already have an account, just sign in. We've missed you!</p>
                <Button 
                  size="large" 
                  onClick={handleSwap}
                  className="switch-btn"
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Curved Divider */}
        <div className="curved-divider">
          <svg 
            viewBox="0 0 100 100" 
            preserveAspectRatio="none"
            className="curve-svg"
          >
            <path 
              d={isLoginMode ? 
                "M0,0 L70,0 Q100,50 70,100 L0,100 Z" : 
                "M100,0 L30,0 Q0,50 30,100 L100,100 Z"
              }
              fill="white"
            />
          </svg>
        </div>

        {/* Right Section */}
        <div className="auth-right-section">
          <div className="right-content">
            {!isLoginMode ? (
              // Register Form
              <div className="form-wrapper">
                <img src={logo} alt="Bristol Myers Squibb" className="form-logo" />
                <h2>Create Account</h2>
                <p>Please fill in the information below</p>
                
                <Form
                  form={registerForm}
                  onFinish={handleRegister}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="fullName"
                    rules={[{ required: true, message: 'Please enter your name' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Full Name"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input 
                      prefix={<MailOutlined />} 
                      placeholder="Email Address"
                      size="large"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: 'Please enter your password' },
                      { min: 6, message: 'Password must be at least 6 characters' }
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined />}
                      placeholder="Password"
                      size="large"
                      iconRender={(visible: boolean) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                    />
                  </Form.Item>

                  <Form.Item 
                    name="roles" 
                    initialValue={["USER"]}
                  >
                    <Select 
                      mode="multiple" 
                      allowClear
                      size="large"
                      placeholder="Select roles"
                    >
                      <Option value="USER">User</Option>
                      <Option value="ADMIN">Admin</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      loading={loading}
                      size="large"
                      block
                    >
                      REGISTER
                    </Button>
                  </Form.Item>
                </Form>
              </div>
            ) : (
              // Switch Panel for Login Mode
              <div className="switch-panel">
                <h2>New here?</h2>
                <p>Sign up and discover great amount of new opportunities!</p>
                <Button 
                  size="large" 
                  onClick={handleSwap}
                  className="switch-btn"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleAuthPage;
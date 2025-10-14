import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import {
  MailOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from '@ant-design/icons';
import '../App.css';
import facility from '../assets/facility.png';
import iotiq from '../assets/iotiq.png';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signIn, storeAuth } from '../api/auth';


type Props = {
  onLogin: () => void;
};

const { login } = useAuth();

const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

 // Replace the existing onFinish function
const onFinish = async (values: any) => {
  try {
    setLoading(true);
    // Use the context login method
    await login({
      email: values.userId, // using the existing field as email
      password: values.password,
    });
    message.success('Login successful');
    onLogin(); // This should now work properly
  } catch (err: any) {
    message.error(err.message || 'Login failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="page-container">
      {/* Header */}
      <div className="top-header">
        <div className="left-logo">
          <img src={facility} alt="SmartEdgeFM" />
        </div>
        <div className="right-logo">
          <img src={iotiq} alt="IOTIQ" />
        </div>
      </div>

      {/* Centered Login */}
      <div className="login-wrapper">
        <div className="login-card">
          <h2 className="login-heading">Login</h2>
          <img src={logo} alt="Bristol Myers Squibb" className="center-logo" />

          <Form
            form={form}
            onFinish={onFinish}
            layout="vertical"
            requiredMark={false}
          >
            <Form.Item
              label="Email"
              name="userId"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input prefix={<MailOutlined />} placeholder="Enter Email" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter Your Password"
                iconRender={(visible: boolean) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
              />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" className="submit-button" loading={loading}>
                SUBMIT
              </Button>
            </Form.Item>
          </Form>

          <div className="login-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link to="/forgot-password" className="forgot-link">
              Forgot your password?
            </Link>
            <Link to="/register" className="forgot-link">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

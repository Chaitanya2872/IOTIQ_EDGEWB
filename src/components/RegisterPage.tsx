import React, { useState } from 'react';
import { Form, Input, Button, Select, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { signUp, storeAuth } from '../api/auth';

const { Option } = Select;

type Props = { onSignupSuccess?: () => void };

const SignupPage: React.FC<Props> = ({ onSignupSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const res = await signUp({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        roles: values.roles || ['USER'],
      });
      storeAuth(res);
      message.success('Signup successful');
      if (onSignupSuccess) onSignupSuccess();
      // Default behavior: go to login screen
      navigate('/');
    } catch (err: any) {
      message.error(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="login-wrapper">
        <div className="login-card">
          <h2 className="login-heading">Create Account</h2>

          <Form form={form} onFinish={onFinish} layout="vertical" requiredMark={false}>
            <Form.Item label="Full Name" name="fullName" rules={[{ required: true, message: 'Please enter your name' }]}>
              <Input prefix={<UserOutlined />} placeholder="Enter Full Name" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
              <Input prefix={<MailOutlined />} placeholder="Enter Email" />
            </Form.Item>

            <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="Enter Password" />
            </Form.Item>

            <Form.Item label="Roles" name="roles" initialValue={["USER"]}>
              <Select mode="multiple" allowClear>
                <Option value="USER">USER</Option>
                <Option value="ADMIN">ADMIN</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} className="submit-button">
                Sign Up
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
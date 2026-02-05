import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Card, message } from "antd";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import "./Login.css";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return null;
  }

  const onFinish = async (v: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(v.email, v.password);
      message.success("Welcome back!");
      navigate("/", { replace: true });
    } catch {
      message.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="login-container"
      >
        <Card className="login-card">
          <div className="login-card-header">
            <div className="login-logo">
              <img src="/favicon.svg" alt="BuildFlow Logo" />
            </div>
            <h1 className="login-title">BuildFlow</h1>
            <p className="login-subtitle">Sign in to your account</p>
          </div>
          
          <Form
            name="login"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
            className="login-form"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, message: "Please enter your email" }, { type: "email", message: "Please enter a valid email" }]}
            >
              <Input placeholder="admin@buildflow.com" />
            </Form.Item>
            <Form.Item
              label="Password"
              name="password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password placeholder="••••••••" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </motion.div>
    </div>
  );
}

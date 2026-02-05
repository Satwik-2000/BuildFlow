import { Modal, Form, Button } from "antd";
import { motion } from "framer-motion";
import type { FormInstance, FormProps } from "antd";

export interface FormModalProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onFinish: (values: Record<string, unknown>) => void;
  loading?: boolean;
  children: React.ReactNode;
  form?: FormInstance;
  width?: number;
}

export default function FormModal({
  open,
  title,
  onCancel,
  onFinish,
  loading,
  children,
  form,
  width = 560,
}: FormModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onCancel={onCancel}
      footer={null}
      width={width}
      destroyOnHidden
      maskClosable={false}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        size="large"
      >
        {children}
        <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Save
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
}

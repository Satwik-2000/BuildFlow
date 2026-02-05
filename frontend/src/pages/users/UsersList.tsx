import { useState } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { Button, Space, Tag, message, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";
import { Form, Input, Select } from "antd";
import { gql } from "@apollo/client";

const LIST_USERS = gql`
  query Users {
    users { id email name role phone isActive createdAt }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) { id email name role }
  }
`;

const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) { id }
  }
`;

export default function UsersList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const client = useApolloClient();

  const { data, loading } = useQuery(LIST_USERS);
  const [create, { loading: createLoading }] = useMutation(CREATE_USER, {
    onCompleted: () => { message.success("User created"); setModalOpen(false); form.resetFields(); client.refetchQueries({ include: ["Users"] }); },
  });
  const [update, { loading: updateLoading }] = useMutation(UPDATE_USER, {
    onCompleted: () => { message.success("Updated"); setModalOpen(false); setEditingId(null); form.resetFields(); client.refetchQueries({ include: ["Users"] }); },
  });

  const users = data?.users ?? [];

  const onFinish = (v: Record<string, unknown>) => {
    if (editingId) update({ variables: { id: editingId, input: { name: v.name, role: v.role, phone: v.phone, isActive: v.isActive } } });
    else create({ variables: { input: v } });
  };

  const columns = [
    { title: "Email", dataIndex: "email" },
    { title: "Name", dataIndex: "name" },
    { title: "Role", dataIndex: "role", render: (v: string) => <Tag>{v}</Tag> },
    { title: "Phone", dataIndex: "phone" },
    { title: "Status", dataIndex: "isActive", render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Active" : "Inactive"}</Tag> },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: { id: string; name: string; role: string; phone?: string; isActive: boolean }) => (
        <Space>
          <Button type="link" onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true); }}>Edit</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title">Users & Roles</h1>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>Add User</Button>
      </div>
      <DataTable columns={columns} dataSource={users} loading={loading} onSearch={() => {}} searchPlaceholder="Search users..." />
      <FormModal open={modalOpen} title={editingId ? "Edit User" : "New User"} onCancel={() => { setModalOpen(false); setEditingId(null); }} onFinish={onFinish} loading={createLoading || updateLoading} form={form}>
        <Form.Item name="email" label="Email" rules={[{ required: !editingId }, { type: "email" }]}>
          <Input disabled={!!editingId} placeholder="user@example.com" />
        </Form.Item>
        {!editingId && <Form.Item name="password" label="Password" rules={[{ required: true }]}><Input.Password /></Form.Item>}
        <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select options={[{ value: "ADMIN", label: "Admin" }, { value: "MANAGER", label: "Manager" }, { value: "ENGINEER", label: "Engineer" }, { value: "VIEWER", label: "Viewer" }]} />
        </Form.Item>
        <Form.Item name="phone" label="Phone"><Input /></Form.Item>
        {editingId && (
          <Form.Item name="isActive" label="Active">
            <Select options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
          </Form.Item>
        )}
      </FormModal>
    </div>
  );
}

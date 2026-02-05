import { useState } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { Button, Space, Tag, message, Popconfirm, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";
import { Form, Input } from "antd";
import { gql } from "@apollo/client";

const LIST_VENDORS = gql`
  query Vendors($search: String, $type: String) {
    vendors(search: $search, type: $type) {
      id name code type contactPerson email phone isActive
    }
  }
`;

const CREATE_VENDOR = gql`mutation CreateVendor($input: CreateVendorInput!) { createVendor(input: $input) { id } }`;
const UPDATE_VENDOR = gql`mutation UpdateVendor($id: ID!, $input: UpdateVendorInput!) { updateVendor(id: $id, input: $input) { id } }`;
const DELETE_VENDOR = gql`mutation DeleteVendor($id: ID!) { deleteVendor(id: $id) { id } }`;

export default function VendorsList() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const client = useApolloClient();

  const { data, loading } = useQuery(LIST_VENDORS, { variables: { search: search || undefined, type: typeFilter } });
  const [create, { loading: createLoading }] = useMutation(CREATE_VENDOR, {
    onCompleted: () => { message.success("Created"); setModalOpen(false); form.resetFields(); client.refetchQueries({ include: ["Vendors"] }); },
  });
  const [update, { loading: updateLoading }] = useMutation(UPDATE_VENDOR, {
    onCompleted: () => { message.success("Updated"); setModalOpen(false); setEditingId(null); form.resetFields(); client.refetchQueries({ include: ["Vendors"] }); },
  });
  const [remove] = useMutation(DELETE_VENDOR, { onCompleted: () => { message.success("Deleted"); client.refetchQueries({ include: ["Vendors"] }); } });

  const vendors = data?.vendors ?? [];

  const onFinish = (v: Record<string, unknown>) => {
    if (editingId) update({ variables: { id: editingId, input: v } });
    else create({ variables: { input: v } });
  };

  const columns = [
    { title: "Code", dataIndex: "code", width: 100 },
    { title: "Name", dataIndex: "name" },
    { title: "Type", dataIndex: "type" },
    { title: "Contact", dataIndex: "contactPerson" },
    { title: "Email", dataIndex: "email" },
    { title: "Phone", dataIndex: "phone" },
    { title: "Status", dataIndex: "isActive", render: (v: boolean) => <Tag color={v ? "green" : "default"}>{v ? "Active" : "Inactive"}</Tag> },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: { id: string }) => (
        <Space>
          <Button type="link" onClick={() => { setEditingId(r.id); form.setFieldsValue(r); setModalOpen(true); }}>Edit</Button>
          <Popconfirm title="Delete?" onConfirm={() => remove({ variables: { id: r.id } })}>
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <h1 className="page-title">Vendors / Contractors</h1>
        <Space>
          <Select placeholder="Type" allowClear style={{ width: 140 }} onChange={setTypeFilter} options={[
            { value: "contractor", label: "Contractor" },
            { value: "supplier", label: "Supplier" },
            { value: "consultant", label: "Consultant" },
          ]} />
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>Add Vendor</Button>
        </Space>
      </div>
      <DataTable columns={columns} dataSource={vendors} loading={loading} onSearch={setSearch} searchPlaceholder="Search vendors..." />
      <FormModal open={modalOpen} title={editingId ? "Edit Vendor" : "New Vendor"} onCancel={() => { setModalOpen(false); setEditingId(null); }} onFinish={onFinish} loading={createLoading || updateLoading} form={form}>
        <Form.Item name="name" label="Name" rules={[{ required: true }]}><Input /></Form.Item>
        <Form.Item name="code" label="Code"><Input /></Form.Item>
        <Form.Item name="type" label="Type" rules={[{ required: !editingId }]}>
          <Select options={[{ value: "contractor", label: "Contractor" }, { value: "supplier", label: "Supplier" }, { value: "consultant", label: "Consultant" }]} />
        </Form.Item>
        <Form.Item name="contactPerson" label="Contact Person"><Input /></Form.Item>
        <Form.Item name="email" label="Email"><Input type="email" /></Form.Item>
        <Form.Item name="phone" label="Phone"><Input /></Form.Item>
        <Form.Item name="address" label="Address"><Input.TextArea rows={2} /></Form.Item>
        {editingId && (
          <Form.Item name="isActive" label="Active">
            <Select options={[{ value: true, label: "Yes" }, { value: false, label: "No" }]} />
          </Form.Item>
        )}
      </FormModal>
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { Button, Space, Tag, message, Popconfirm, Select } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";
import { Form, Input, DatePicker, InputNumber } from "antd";
import { gql } from "@apollo/client";

const LIST_CONTRACTS = gql`
  query ListContracts($projectId: ID, $vendorId: ID) {
    contracts(projectId: $projectId, vendorId: $vendorId) {
      id contractNo title value startDate endDate status
      project { id name code }
      vendor { id name }
    }
  }
`;

const LIST_PROJECTS = gql`query { projects { id name code } }`;
const LIST_VENDORS = gql`query { vendors { id name } }`;

const CREATE_CONTRACT = gql`
  mutation CreateContract($input: CreateContractInput!) {
    createContract(input: $input) { id }
  }
`;

const UPDATE_CONTRACT = gql`
  mutation UpdateContract($id: ID!, $input: UpdateContractInput!) {
    updateContract(id: $id, input: $input) { id }
  }
`;

const DELETE_CONTRACT = gql`
  mutation DeleteContract($id: ID!) {
    deleteContract(id: $id) { id }
  }
`;

export default function ContractsList() {
  const [projectFilter, setProjectFilter] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const client = useApolloClient();

  const { data, loading } = useQuery(LIST_CONTRACTS, { variables: { projectId: projectFilter } });
  const { data: projectsData } = useQuery(LIST_PROJECTS, { fetchPolicy: "cache-first" });
  const { data: vendorsData } = useQuery(LIST_VENDORS);
  const [create, { loading: createLoading }] = useMutation(CREATE_CONTRACT, {
    onCompleted: () => { message.success("Created"); setModalOpen(false); form.resetFields(); client.refetchQueries({ include: ["ListContracts", "ListProjects"] }); },
    onError: (e) => message.error(e.message),
  });
  const [update, { loading: updateLoading }] = useMutation(UPDATE_CONTRACT, {
    onCompleted: () => { message.success("Updated"); setModalOpen(false); setEditingId(null); form.resetFields(); client.refetchQueries({ include: ["ListContracts", "ListProjects"] }); },
    onError: (e) => message.error(e.message),
  });
  const [remove] = useMutation(DELETE_CONTRACT, {
    onCompleted: () => { message.success("Deleted"); client.refetchQueries({ include: ["ListContracts", "ListProjects"] }); },
    onError: (e) => message.error(e.message),
  });

  const contracts = data?.contracts ?? [];
  const projects = projectsData?.projects ?? [];
  const vendors = vendorsData?.vendors ?? [];

  const toDateStr = (d: unknown) => (d && typeof (d as { toISOString?: () => string }).toISOString === "function" ? (d as { toISOString: () => string }).toISOString() : undefined);

  const onFinish = (v: Record<string, unknown>) => {
    if (editingId) {
      update({
        variables: {
          id: editingId,
          input: {
            title: v.title,
            value: v.value,
            startDate: toDateStr(v.startDate),
            endDate: toDateStr(v.endDate),
            description: v.description,
          },
        },
      });
    } else {
      create({
        variables: {
          input: {
            projectId: v.projectId,
            vendorId: v.vendorId,
            contractNo: v.contractNo,
            title: v.title,
            value: v.value,
            startDate: toDateStr(v.startDate),
            endDate: toDateStr(v.endDate),
            description: v.description,
          },
        },
      });
    }
  };

  const columns = [
    { title: "Contract No", dataIndex: "contractNo", width: 120 },
    { title: "Title", dataIndex: "title" },
    { title: "Project", dataIndex: ["project", "name"] },
    { title: "Vendor", dataIndex: ["vendor", "name"] },
    { title: "Value", dataIndex: "value", render: (v: number) => `₹${Number(v).toLocaleString()}` },
    { title: "Start", dataIndex: "startDate", render: (v: string) => v ? dayjs(v).format("DD MMM YYYY") : "-" },
    { title: "Status", dataIndex: "status", render: (v: string) => <Tag color={v === "active" ? "green" : "default"}>{v}</Tag> },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: { id: string }) => (
        <Space>
          <Button type="link" onClick={() => {
            setEditingId(r.id);
            form.setFieldsValue({
              title: (r as { title: string }).title,
              value: (r as { value: number }).value,
              description: (r as { description?: string }).description,
              projectId: (r as { project?: { id: string } }).project?.id,
              vendorId: (r as { vendor?: { id: string } }).vendor?.id,
              contractNo: (r as { contractNo: string }).contractNo,
              startDate: (r as { startDate?: string }).startDate ? dayjs((r as { startDate: string }).startDate) : undefined,
              endDate: (r as { endDate?: string }).endDate ? dayjs((r as { endDate: string }).endDate) : undefined,
            });
            setModalOpen(true);
          }}>Edit</Button>
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
        <h1 className="page-title">Contracts</h1>
        <Space>
          <Select
            placeholder="Filter by project"
            allowClear
            style={{ width: 200 }}
            onChange={setProjectFilter}
            options={projects.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))}
          />
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditingId(null); form.resetFields(); setModalOpen(true); }}>
            Add Contract
          </Button>
        </Space>
      </div>
      <DataTable columns={columns} dataSource={contracts} loading={loading} />
      <FormModal open={modalOpen} title={editingId ? "Edit Contract" : "New Contract"} onCancel={() => { setModalOpen(false); setEditingId(null); }} onFinish={onFinish} loading={createLoading || updateLoading} form={form} width={600}>
        <Form.Item name="projectId" label="Project" rules={[{ required: !editingId }]}>
          <Select placeholder="Select project" options={projects.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))} disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="vendorId" label="Vendor" rules={[{ required: !editingId }]}>
          <Select placeholder="Select vendor" options={vendors.map((v: { id: string; name: string }) => ({ value: v.id, label: v.name }))} disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="contractNo" label="Contract No" rules={[{ required: !editingId }]}>
          <Input placeholder="CON-001" disabled={!!editingId} />
        </Form.Item>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Contract title" />
        </Form.Item>
        <Form.Item name="value" label="Value (₹)" rules={[{ required: true }]}>
          <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
        </Form.Item>
        <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="endDate" label="End Date">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={2} />
        </Form.Item>
      </FormModal>
    </div>
  );
}

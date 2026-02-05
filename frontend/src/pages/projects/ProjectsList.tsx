import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { useApolloClient } from "@apollo/client";
import { Button, Space, Tag, message, Popconfirm } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";
import { Form, Input, InputNumber, DatePicker, Select } from "antd";
import {
  LIST_PROJECTS,
  CREATE_PROJECT,
  UPDATE_PROJECT,
  DELETE_PROJECT,
} from "../../graphql/projects";

export default function ProjectsList() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const client = useApolloClient();

  const { data, loading } = useQuery(LIST_PROJECTS, {
    variables: { search: search || undefined, status },
  });
  const [create, { loading: createLoading }] = useMutation(CREATE_PROJECT, {
    onCompleted: () => {
      message.success("Project created");
      setModalOpen(false);
      form.resetFields();
      client.refetchQueries({ include: ["ListProjects"] });
    },
    onError: (e) => message.error(e.message),
  });
  const [update, { loading: updateLoading }] = useMutation(UPDATE_PROJECT, {
    onCompleted: () => {
      message.success("Project updated");
      setModalOpen(false);
      setEditingId(null);
      form.resetFields();
      client.refetchQueries({ include: ["ListProjects"] });
    },
    onError: (e) => message.error(e.message),
  });
  const [remove] = useMutation(DELETE_PROJECT, {
    onCompleted: () => {
      message.success("Project deleted");
      client.refetchQueries({ include: ["ListProjects"] });
    },
    onError: (e) => message.error(e.message),
  });

  const projects = data?.projects ?? [];

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: { id: string; name: string; code: string; description?: string; location?: string; startDate?: string; endDate?: string; budget?: number; status?: string }) => {
    setEditingId(record.id);
    form.setFieldsValue({
      name: record.name,
      description: record.description,
      location: record.location,
      startDate: record.startDate ? dayjs(record.startDate) : undefined,
      endDate: record.endDate ? dayjs(record.endDate) : undefined,
      budget: record.budget,
      status: record.status,
    });
    setModalOpen(true);
  };

  const toDateStr = (d: unknown) => {
    if (!d) return undefined;
    if (typeof d === "string") return d;
    const x = d as { toISOString?: () => string };
    return x?.toISOString?.() ?? undefined;
  };

  const onFinish = (v: Record<string, unknown>) => {
    if (editingId) {
      update({
        variables: {
          id: editingId,
          input: {
            name: v.name,
            description: v.description,
            location: v.location,
            startDate: toDateStr(v.startDate),
            endDate: toDateStr(v.endDate),
            budget: v.budget,
            status: v.status,
          },
        },
      });
    } else {
      create({
        variables: {
          input: {
            name: v.name,
            code: v.code,
            description: v.description,
            location: v.location,
            startDate: toDateStr(v.startDate),
            endDate: toDateStr(v.endDate),
            budget: v.budget,
          },
        },
      });
    }
  };

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", width: 120 },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Location", dataIndex: "location", key: "location" },
    {
      title: "Start",
      dataIndex: "startDate",
      key: "startDate",
      render: (v: string) => (v ? dayjs(v).format("DD MMM YYYY") : "-"),
    },
    {
      title: "Budget",
      dataIndex: "budget",
      key: "budget",
      render: (v: number) => (v != null ? `₹${Number(v).toLocaleString()}` : "-"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (v: string) => <Tag color={v === "active" ? "green" : "default"}>{v}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: { id: string; name: string; code: string; description?: string; location?: string; startDate?: string; endDate?: string; budget?: number; status?: string }) => (
        <Space>
          <Button type="link" onClick={() => navigate(`/projects/${r.id}`)}>View</Button>
          <Button type="link" onClick={() => openEdit(r)}>Edit</Button>
          <Popconfirm
            title="Delete project?"
            onConfirm={() => remove({ variables: { id: r.id } })}
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 className="page-title">Projects</h1>
        <Button type="primary" icon={<PlusOutlined />} size="large" onClick={openCreate}>
          Add Project
        </Button>
      </div>
      <DataTable
        columns={columns}
        dataSource={projects}
        loading={loading}
        onSearch={setSearch}
        searchPlaceholder="Search projects..."
      />
      <FormModal
        open={modalOpen}
        title={editingId ? "Edit Project" : "New Project"}
        onCancel={() => { setModalOpen(false); setEditingId(null); form.resetFields(); }}
        onFinish={onFinish}
        loading={createLoading || updateLoading}
        form={form}
      >
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input placeholder="Project name" />
        </Form.Item>
        {!editingId && (
          <Form.Item label="Code" name="code" rules={[{ required: true }]}>
            <Input placeholder="PRJ-001" />
          </Form.Item>
        )}
        <Form.Item label="Description" name="description">
          <Input.TextArea rows={2} placeholder="Brief description" />
        </Form.Item>
        <Form.Item label="Location" name="location">
          <Input placeholder="Site location" />
        </Form.Item>
        <Form.Item label="Start Date" name="startDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="End Date" name="endDate">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item label="Budget (₹)" name="budget">
          <InputNumber style={{ width: "100%" }} min={0} placeholder="0" />
        </Form.Item>
        {editingId && (
          <Form.Item label="Status" name="status">
            <Select options={[
              { value: "active", label: "Active" },
              { value: "completed", label: "Completed" },
              { value: "on-hold", label: "On Hold" },
            ]} />
          </Form.Item>
        )}
      </FormModal>
    </div>
  );
}

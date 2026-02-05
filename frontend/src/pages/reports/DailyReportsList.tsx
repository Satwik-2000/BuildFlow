import { useMemo, useState } from "react";
import { useQuery, useMutation, useApolloClient } from "@apollo/client";
import { Button, Space, message, Popconfirm, Select, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";
import { Form, Input, DatePicker, InputNumber } from "antd";
import { gql } from "@apollo/client";

const LIST_REPORTS = gql`
  query DailyReports($projectId: ID!, $from: DateTime, $to: DateTime) {
    dailyReports(projectId: $projectId, from: $from, to: $to) {
      id reportDate weather workDone manpower equipment issues createdAt
      project { name }
    }
  }
`;

const LIST_PROJECTS = gql`query { projects { id name code } }`;

const CREATE_REPORT = gql`
  mutation CreateDailyReport($input: CreateDailyReportInput!) {
    createDailyReport(input: $input) { id }
  }
`;

const UPDATE_REPORT = gql`
  mutation UpdateDailyReport($id: ID!, $input: UpdateDailyReportInput!) {
    updateDailyReport(id: $id, input: $input) { id }
  }
`;

const DELETE_REPORT = gql`
  mutation DeleteDailyReport($id: ID!) {
    deleteDailyReport(id: $id) { id }
  }
`;

export default function DailyReportsList() {
  const [projectId, setProjectId] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();
  const client = useApolloClient();

  const { data: projectsData } = useQuery(LIST_PROJECTS);
  const projects = projectsData?.projects ?? [];
  const firstProject = projects[0]?.id;
  const activeProject = projectId || firstProject;

  // Freeze the date range so the query variables stay stable
  const { from, to } = useMemo(() => {
    const now = dayjs();
    return {
      from: now.subtract(30, "day").toISOString(),
      to: now.toISOString(),
    };
  }, []);

  const { data, loading, error } = useQuery(LIST_REPORTS, {
    variables: {
      projectId: activeProject || firstProject || "",
      from,
      to,
    },
    skip: !activeProject,
  });

  const [create, { loading: createLoading }] = useMutation(CREATE_REPORT, {
    onCompleted: () => { message.success("Report created"); setModalOpen(false); form.resetFields(); client.refetchQueries({ include: ["DailyReports"] }); },
  });
  const [update, { loading: updateLoading }] = useMutation(UPDATE_REPORT, {
    onCompleted: () => { message.success("Updated"); setModalOpen(false); setEditingId(null); form.resetFields(); client.refetchQueries({ include: ["DailyReports"] }); },
  });
  const [remove] = useMutation(DELETE_REPORT, { onCompleted: () => { message.success("Deleted"); client.refetchQueries({ include: ["DailyReports"] }); } });

  const reports = data?.dailyReports ?? [];
  const isLoading = loading && !error && !data;

  const toDateStr = (d: unknown) => (d && typeof (d as { toISOString?: () => string }).toISOString === "function" ? (d as { toISOString: () => string }).toISOString() : undefined);

  const onFinish = (v: Record<string, unknown>) => {
    const base = { reportDate: toDateStr(v.reportDate), weather: v.weather, workDone: v.workDone, manpower: v.manpower, equipment: v.equipment, issues: v.issues, remarks: v.remarks };
    if (editingId) {
      update({ variables: { id: editingId, input: base } });
    } else {
      create({ variables: { input: { ...base, projectId: activeProject } } });
    }
  };

  const columns = [
    { title: "Date", dataIndex: "reportDate", render: (v: string) => dayjs(v).format("DD MMM YYYY") },
    { title: "Project", dataIndex: ["project", "name"] },
    { title: "Weather", dataIndex: "weather" },
    { title: "Work Done", dataIndex: "workDone", ellipsis: true },
    { title: "Manpower", dataIndex: "manpower" },
    {
      title: "Actions",
      key: "actions",
      render: (_: unknown, r: { id: string; reportDate: string; weather?: string; workDone: string; manpower?: number; equipment?: string; issues?: string; remarks?: string }) => (
        <Space>
          <Button type="link" onClick={() => { setEditingId(r.id); form.setFieldsValue({ ...r, reportDate: r.reportDate ? dayjs(r.reportDate) : null }); setModalOpen(true); }}>Edit</Button>
          <Popconfirm title="Delete report?" onConfirm={() => remove({ variables: { id: r.id } })}>
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <h1 className="page-title">Daily Site Reports</h1>
        <Space>
          <Select placeholder="Select project" value={activeProject || undefined} onChange={setProjectId} style={{ width: 200 }} options={projects.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))} />
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => { setEditingId(null); form.resetFields(); form.setFieldsValue({ reportDate: dayjs() }); setModalOpen(true); }} disabled={!activeProject}>Add Report</Button>
        </Space>
      </div>
      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message="Unable to load daily reports"
          description={error.message}
        />
      )}
      <DataTable columns={columns} dataSource={reports} loading={isLoading} />
      <FormModal open={modalOpen} title={editingId ? "Edit Report" : "New Daily Report"} onCancel={() => { setModalOpen(false); setEditingId(null); }} onFinish={onFinish} loading={createLoading || updateLoading} form={form} width={640}>
        <Form.Item name="reportDate" label="Report Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="weather" label="Weather"><Input placeholder="Sunny, Cloudy, Rain, etc." /></Form.Item>
        <Form.Item name="workDone" label="Work Done" rules={[{ required: true }]}><Input.TextArea rows={4} placeholder="Describe work completed today" /></Form.Item>
        <Form.Item name="manpower" label="Manpower"><InputNumber style={{ width: "100%" }} min={0} placeholder="0" /></Form.Item>
        <Form.Item name="equipment" label="Equipment"><Input.TextArea rows={2} placeholder="Equipment on site" /></Form.Item>
        <Form.Item name="issues" label="Issues"><Input.TextArea rows={2} placeholder="Any issues or delays" /></Form.Item>
        <Form.Item name="remarks" label="Remarks"><Input.TextArea rows={2} /></Form.Item>
      </FormModal>
    </div>
  );
}

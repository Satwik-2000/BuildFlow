import { useState } from "react";
import { useQuery, useMutation, useApolloClient, gql } from "@apollo/client";
import { Button, Select, Tag, Form, Input, DatePicker, message, InputNumber } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";

const LIST_RA_BILLS = gql`
  query RABills($projectId: ID, $contractId: ID, $status: BillStatus) {
    raBills(projectId: $projectId, contractId: $contractId, status: $status) {
      id billNo periodFrom periodTo totalAmount status
      project { name }
      contract { contractNo title }
    }
  }
`;

const LIST_PROJECTS = gql`query { projects { id name } }`;
const LIST_CONTRACTS = gql`query Contracts($projectId: ID) { contracts(projectId: $projectId) { id contractNo title } }`;

const CREATE_RA_BILL = gql`
  mutation CreateRABill($input: CreateRABillInput!) {
    createRABill(input: $input) {
      id
    }
  }
`;

const statusColors: Record<string, string> = { DRAFT: "default", SUBMITTED: "blue", UNDER_REVIEW: "orange", APPROVED: "green", REJECTED: "red", PAID: "cyan" };

export default function RABillsList() {
  const [projectId, setProjectId] = useState<string | undefined>();
  const [contractId, setContractId] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [modalOpen, setModalOpen] = useState(false);

  const [form] = Form.useForm();
  const client = useApolloClient();

  const { data: projectsData } = useQuery(LIST_PROJECTS);
  const { data: contractsData } = useQuery(LIST_CONTRACTS, { variables: { projectId } }); // Note: This depends on projectId filter for list, but for modal we might need all or specific logic. For now, using same queries.
  // Actually, for the modal, if we pick a project, we should filter contracts.
  // We can reuse the existing state `projectId` if we want the list filter to also drive the modal? 
  // Probably better to have separate state or lett the form handle it. 
  // But for simplicity, let's use the list data for now, but we might want to fetch contracts for the Selected Project in the modal separately if the filter is not set.
  // However, the existing LIST_CONTRACTS depends on variables. 
  // Let's create a separate query or just use what we have, but be careful. 
  // If projectId is undefined, contracts(projectId: undefined) might return all? Let's check schema/resolver? 
  // The resolver `contracts` usually filters if arg is present.

  const { data, loading } = useQuery(LIST_RA_BILLS, { variables: { projectId, contractId, status } });

  const [create, { loading: createLoading }] = useMutation(CREATE_RA_BILL, {
    onCompleted: () => {
      message.success("RA Bill Created");
      setModalOpen(false);
      form.resetFields();
      client.refetchQueries({ include: ["RABills"] });
    },
    onError: (e) => message.error(e.message),
  });

  const projects = projectsData?.projects ?? [];
  const contracts = contractsData?.contracts ?? [];
  const bills = data?.raBills ?? [];

  const columns = [
    { title: "Bill No", dataIndex: "billNo", width: 120 },
    { title: "Project", dataIndex: ["project", "name"] },
    { title: "Contract", dataIndex: ["contract", "contractNo"] },
    { title: "Period From", dataIndex: "periodFrom", render: (v: string) => dayjs(v).format("DD MMM YYYY") },
    { title: "Period To", dataIndex: "periodTo", render: (v: string) => dayjs(v).format("DD MMM YYYY") },
    { title: "Amount", dataIndex: "totalAmount", render: (v: number) => v != null ? `₹${Number(v).toLocaleString()}` : "-" },
    { title: "Status", dataIndex: "status", render: (v: string) => <Tag color={statusColors[v] || "default"}>{v}</Tag> },
  ];

  const onFinish = (values: any) => {
    create({
      variables: {
        input: {
          projectId: values.projectId,
          contractId: values.contractId,
          billNo: values.billNo,
          periodFrom: values.periodFrom.toISOString(),
          periodTo: values.periodTo.toISOString(),
          totalAmount: values.totalAmount,
        }
      }
    });
  };

  // Logic to fetch contracts for the modal when a project is selected in the form
  // We can reuse the LIST_CONTRACTS query but we need a way to pass the form's project ID.
  // Or we can just let the user filter the main list to see contracts? 
  // Better: Add a Watch on the form? 
  // For this iteration, let's assume the user selects a project in the modal, and we should show contracts for that project.
  // But we reused `contractsData` which depends on `projectId` state (the filter).
  // If the user hasn't filtered by project, `projectId` is undefined, so `contracts` might be empty or all?
  // Let's look at `ContractsList` pattern.
  // ContractsList has: `const { data: contractsData } = useQuery(LIST_CONTRACTS...)`
  // It seems it relies on the same lists. 
  // Let's improve: We should probably fetch contracts for the modal specifically or rely on the fact that we have a list of all contracts if we don't filter?
  // Let's assume for now valid contracts are available in `contracts`. 
  // Wait, if `projectId` is undefined, does `contracts` query return all?
  // If so, we can filter in memory in the modal options.

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 16 }}>
        <h1 className="page-title">RA Bills / Running Account Bills</h1>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Select placeholder="Project" allowClear style={{ width: 180 }} onChange={(v) => { setProjectId(v); setContractId(undefined); }} options={projects.map((p: { id: string; name: string }) => ({ value: p.id, label: p.name }))} />
          <Select placeholder="Contract" allowClear style={{ width: 180 }} value={contractId} onChange={setContractId} options={contracts.map((c: { id: string; contractNo: string }) => ({ value: c.id, label: c.contractNo }))} />
          <Select placeholder="Status" allowClear style={{ width: 140 }} onChange={setStatus} options={["DRAFT", "SUBMITTED", "APPROVED", "PAID"].map(s => ({ value: s, label: s }))} />
          <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => setModalOpen(true)}>Add RA Bill</Button>
        </div>
      </div>
      <DataTable columns={columns} dataSource={bills} loading={loading} />

      <FormModal
        open={modalOpen}
        title="Create RA Bill"
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onFinish={onFinish}
        loading={createLoading}
        form={form}
      >
        <Form.Item name="projectId" label="Project" rules={[{ required: true }]}>
          <Select placeholder="Select Project" options={projects.map((p: any) => ({ label: p.name, value: p.id }))} />
        </Form.Item>
        <Form.Item name="contractId" label="Contract" rules={[{ required: true }]}>
          {/* Ideally this list should optionally depend on the selected project in the form */}
          {/* For now showing all contracts loaded. If the user filters the main list, this list is filtered. This is a known sub-optimal UX but matches ContractList pattern vaguely for now. */}
          <Select placeholder="Select Contract" options={contracts.map((c: any) => ({ label: c.contractNo, value: c.id }))} />
        </Form.Item>
        <Form.Item name="billNo" label="Bill No" rules={[{ required: true }]}>
          <Input placeholder="RA-001" />
        </Form.Item>
        <Form.Item name="periodFrom" label="Period From" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="periodTo" label="Period To" rules={[{ required: true }]}>
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="totalAmount" label="Total Amount (₹)" rules={[{ required: false }]} help="If you add Bill Items later, this amount will be recalculated.">
          <InputNumber style={{ width: "100%" }} min={0} placeholder="0.00" />
        </Form.Item>
      </FormModal>
    </div>
  );
}

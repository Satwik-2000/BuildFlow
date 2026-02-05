import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { Button, Card, Table, Tag, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { GET_PROJECT } from "../../graphql/projects";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, loading } = useQuery(GET_PROJECT, { variables: { id: id! }, skip: !id });

  const project = data?.project;

  if (!id) return <div>Invalid project</div>;
  if (loading) return <Spin size="large" />;
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/projects")}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      <h1 className="page-title">{project.name}</h1>
      <Card>
        <p><strong>Code:</strong> {project.code}</p>
        <p><strong>Status:</strong> <Tag color="green">{project.status}</Tag></p>
        {project.description && <p><strong>Description:</strong> {project.description}</p>}
        {project.location && <p><strong>Location:</strong> {project.location}</p>}
        {project.startDate && <p><strong>Start:</strong> {dayjs(project.startDate).format("DD MMM YYYY")}</p>}
        {project.endDate && <p><strong>End:</strong> {dayjs(project.endDate).format("DD MMM YYYY")}</p>}
        {project.budget != null && <p><strong>Budget:</strong> ₹{Number(project.budget).toLocaleString()}</p>}
      </Card>
      {project.contracts?.length > 0 && (
        <Card title="Contracts" style={{ marginTop: 24 }}>
          <Table
            dataSource={project.contracts}
            rowKey="id"
            columns={[
              { title: "Contract No", dataIndex: "contractNo" },
              { title: "Title", dataIndex: "title" },
              { title: "Value", dataIndex: "value", render: (v: number) => `₹${Number(v).toLocaleString()}` },
              { title: "Status", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
            ]}
            pagination={false}
          />
        </Card>
      )}
      {project.milestones?.length > 0 && (
        <Card title="Milestones" style={{ marginTop: 24 }}>
          <Table
            dataSource={project.milestones}
            rowKey="id"
            columns={[
              { title: "Name", dataIndex: "name" },
              { title: "Due Date", dataIndex: "dueDate", render: (v: string) => v ? dayjs(v).format("DD MMM YYYY") : "-" },
              { title: "Amount", dataIndex: "amount", render: (v: number) => v != null ? `₹${Number(v).toLocaleString()}` : "-" },
              { title: "Status", dataIndex: "status", render: (v: string) => <Tag>{v}</Tag> },
            ]}
            pagination={false}
          />
        </Card>
      )}
    </div>
  );
}

import React from "react";
import { Button, Card, Typography } from "tushan";
import { useAdminStore } from "../useAdminStore";
import Link from "next/link";

export const AdminDashboard: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);

  const updateUrl = `${window.origin}/api/${projectId}/manifest`;
  const installCli = `npm install -g ecus-cli`;

  return (
    <div className="flex flex-col gap-2">
      <Card>
        <Typography.Title heading={6}>Project ID</Typography.Title>
        <Typography.Text copyable={{ text: projectId }} code>
          {projectId}
        </Typography.Text>
      </Card>

      <Card>
        <Typography.Title heading={6}>
          Update your update url in{" "}
          <Typography.Text type="primary">app.json</Typography.Text>
        </Typography.Title>
        <Typography.Text copyable={{ text: updateUrl }} code={true}>
          {updateUrl}
        </Typography.Text>
      </Card>

      <Card>
        <Typography.Title heading={6}>
          Download <Typography.Text type="primary">ecus-cli</Typography.Text>
        </Typography.Title>
        <Typography.Text code={true} copyable={{ text: installCli }}>
          {installCli}
        </Typography.Text>
      </Card>

      <Card>
        <Typography.Title heading={6}>Get your API key</Typography.Title>
        <Link href="/admin/apikey">
          <Button type="primary">Click here to get your API key</Button>
        </Link>
      </Card>
    </div>
  );
});
AdminDashboard.displayName = "AdminDashboard";

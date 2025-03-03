import React from "react";
import { Card, Typography } from "tushan";
import { useAdminStore } from "../useAdminStore";

export const AdminDashboard: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);

  const updateUrl = `${window.origin}/api/${projectId}/manifest}`;

  return (
    <div className="flex flex-col gap-2">
      <h1>Dashboard</h1>

      <Card>
        <Typography.Title heading={6}>Project ID</Typography.Title>
        <Typography.Text copyable={{ text: projectId }}>
          {projectId}
        </Typography.Text>
      </Card>

      <Card>
        <Typography.Title heading={6}>Update your update url</Typography.Title>
        <Typography.Text copyable={{ text: updateUrl }}>
          {updateUrl}
        </Typography.Text>
      </Card>
    </div>
  );
});
AdminDashboard.displayName = "AdminDashboard";

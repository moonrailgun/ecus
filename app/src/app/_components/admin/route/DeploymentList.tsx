import React from "react";
import { Button, createTextField, ListTable, useNavigate } from "tushan";
import { useAdminStore } from "../useAdminStore";
import { IconPlus } from "tushan/client/icon";

export const DeploymentList: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);
  const navigate = useNavigate();

  return (
    <>
      <Button
        className="mb-2"
        type="primary"
        icon={<IconPlus />}
        onClick={() => navigate("/deployment/create")}
      >
        Create
      </Button>
      <ListTable
        defaultFilter={{ projectId }}
        fields={[
          createTextField("id", {
            label: "ID",
          }),
        ]}
      />
    </>
  );
});
DeploymentList.displayName = "DeploymentList";

import React from "react";
import {
  createReferenceField,
  createTextField,
  ListTable,
  createDateTimeField,
  LoadingView,
} from "tushan";
import { useAdminStore } from "../useAdminStore";

const fields = [
  createTextField("projectId"),
  createTextField("runtimeVersion"),
  createReferenceField("branchId", {
    label: "Branch",
    reference: "branch",
    displayField: "name",
  }),
  createReferenceField("deploymentId", {
    label: "Deployment",
    reference: "deployment",
    displayField: (record) => <div>{record.id}</div>,
  }),
  createDateTimeField("updatedAt"),
];

export const ActiveList: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);

  if (!projectId) {
    return <LoadingView />;
  }

  return (
    <>
      <ListTable
        defaultFilter={{ projectId }}
        fields={fields}
        action={{
          detail: true,
        }}
      />
    </>
  );
});
ActiveList.displayName = "ActiveList";

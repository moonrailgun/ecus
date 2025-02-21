import React from "react";
import {
  createReferenceField,
  createTextField,
  ListTable,
  createDateTimeField,
} from "tushan";
import { useAdminStore } from "../useAdminStore";

const fields = [
  createTextField("projectId"),
  createTextField("runtimeVersion"),
  createTextField("branchId"),
  createReferenceField("deploymentId"),
  createDateTimeField("updatedAt"),
];

export const ActiveList: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);

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

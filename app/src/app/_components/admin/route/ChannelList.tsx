import React, { useMemo } from "react";
import {
  createTextField,
  ListTable,
  createDateTimeField,
  LoadingView,
} from "tushan";
import { useAdminStore } from "../useAdminStore";

export const ChannelList: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);
  const fields = useMemo(
    () => [
      createTextField("id"),
      createTextField("projectId", {
        create: {
          hidden: true,
          default: projectId,
        },
        edit: {
          hidden: true,
        },
      }),
      createTextField("name", {
        create: {
          rules: [{ required: true, message: "Channel name is required" }],
        },
      }),
      createDateTimeField("createdAt", {
        create: {
          hidden: true,
        },
        edit: {
          hidden: true,
        },
      }),
    ],
    [projectId],
  );

  if (!projectId) {
    return <LoadingView />;
  }

  return (
    <>
      <ListTable
        key={projectId}
        defaultFilter={{ projectId }}
        fields={fields}
        action={{
          create: true,
          detail: true,
          delete: true,
        }}
      />
    </>
  );
});
ChannelList.displayName = "ChannelList";

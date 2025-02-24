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
  createTextField("id"),
  createTextField("projectId"),
  createTextField("name"),
  createDateTimeField("createdAt"),
];

export const ChannelList: React.FC = React.memo(() => {
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
ChannelList.displayName = "ChannelList";

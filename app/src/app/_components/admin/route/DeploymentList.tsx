import React from "react";
import {
  Avatar,
  Button,
  createReferenceField,
  createTextField,
  createCustomField,
  ListTable,
  useNavigate,
} from "tushan";
import { useAdminStore } from "../useAdminStore";
import { IconPlus } from "tushan/client/icon";
import { first, get } from "lodash-es";
import { RemoteFileViewer } from "../../RemoteFileViewer";

const fields = [
  createTextField("id", {
    label: "ID",
  }),
  createTextField("runtimeVersion", {
    label: "Runtime Version",
    list: {
      width: 160,
    },
  }),
  createReferenceField("userId", {
    label: "User",
    reference: "user",
    displayField: (data) => (
      <Avatar size={24}>
        {get(data, "image") ? (
          <img alt="avatar" src={get(data, "image")} />
        ) : (
          String(first(get(data, "name"))).toUpperCase()
        )}
      </Avatar>
    ),
  }),
];

const drawerFields = [
  ...fields,
  createCustomField("id", {
    label: "Metadata",
    render: (id) => {
      return (
        <RemoteFileViewer
          url={`/api/${useAdminStore.getState().projectId}/updates/${id}/metadata.json`}
        />
      );
    },
  }),
  createCustomField("id", {
    label: "Config",
    render: (id) => {
      return (
        <RemoteFileViewer
          url={`/api/${useAdminStore.getState().projectId}/updates/${id}/expoConfig.json`}
        />
      );
    },
  }),
];

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
        fields={fields}
        drawerFields={drawerFields}
        action={{
          detail: true,
        }}
      />
    </>
  );
});
DeploymentList.displayName = "DeploymentList";

import React from "react";
import {
  Avatar,
  Button,
  createReferenceField,
  createTextField,
  createCustomField,
  ListTable,
  useNavigate,
  createDateTimeField,
  Tabs,
  LoadingView,
} from "tushan";
import { useAdminStore } from "../useAdminStore";
import { IconPlus } from "tushan/icon";
import { first, get } from "lodash-es";
import { RemoteFileViewer } from "../../RemoteFileViewer";
import { PromoteDeploymentModal } from "./PromoteDeploymentModal";
import { openModal } from "../../AdminGlobalModal";
import { DeploymentStatus } from "./DeploymentStatusField";

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
  createReferenceField("branchId", {
    label: "Branch",
    reference: "branch",
    displayField: "name",
  }),
  createCustomField("id", {
    label: "Status",
    render: (id, record) => {
      return (
        <DeploymentStatus
          deploymentId={String(record.id)}
          projectId={record.projectId}
          runtimeVersion={record.runtimeVersion}
        />
      );
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
  createDateTimeField("createdAt", {
    label: "createdAt",
  }),
];

const drawerFields = [
  ...fields,
  createCustomField("id", {
    label: "Config",
    render: (id) => {
      const projectId = useAdminStore.getState().projectId;

      return (
        <Tabs>
          <Tabs.TabPane key="meta" title="Metadata" lazyload>
            <RemoteFileViewer
              url={`/api/${projectId}/updates/${id}/metadata.json`}
            />
          </Tabs.TabPane>
          <Tabs.TabPane key="expo" title="Expo" lazyload>
            <RemoteFileViewer
              url={`/api/${projectId}/updates/${id}/expoConfig.json`}
            />
          </Tabs.TabPane>
        </Tabs>
      );
    },
  }),
];

export const DeploymentList: React.FC = React.memo(() => {
  const projectId = useAdminStore((state) => state.projectId);
  const navigate = useNavigate();

  if (!projectId) {
    return <LoadingView />;
  }

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
          custom: [
            // {
            //   key: "assign",
            //   label: "Assign Branch",
            //   onClick: (record) => {
            //     // TODO
            //     console.log("record", record);
            //   },
            // },
            {
              key: "promote",
              label: "Promote",
              onClick: (record) => {
                openModal(
                  <PromoteDeploymentModal
                    deploymentId={String(record.id)}
                    runtimeVersion={String(record.runtimeVersion)}
                  />,
                );
              },
            },
          ],
        }}
      />
    </>
  );
});
DeploymentList.displayName = "DeploymentList";

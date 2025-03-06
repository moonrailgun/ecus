import { api } from "@/trpc/react";
import React from "react";
import { Tag } from "tushan";
import { IconArrowUp } from "tushan/icon";

interface DeploymentStatusProps {
  deploymentId: string;
  projectId: string;
  runtimeVersion: string;
}
export const DeploymentStatus: React.FC<DeploymentStatusProps> = React.memo(
  (props) => {
    const { projectId, runtimeVersion, deploymentId } = props;
    const { data: activeDeployment } = api.deployment.activeDeployment.useQuery(
      {
        projectId,
        runtimeVersion,
      },
      {
        select: (data) => {
          return data.filter(
            (item) => item.active_deployment.deploymentId === deploymentId,
          );
        },
      },
    );

    return (
      <div className="flex flex-wrap gap-1">
        {activeDeployment?.map((ad, i) => (
          <div key={i}>
            <Tag color="arcoblue">
              {ad.channel?.name} <IconArrowUp />
            </Tag>
          </div>
        ))}
      </div>
    );
  },
);
DeploymentStatus.displayName = "DeploymentStatus";

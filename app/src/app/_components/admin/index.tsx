"use client";

import { useEffect, useState } from "react";
import { jsonServerProvider, Resource, Tushan, LoadingView } from "tushan";
import { useSession } from "next-auth/react";
import { IconApps } from "tushan/client/icon";
import React from "react";
import { DeploymentCreate } from "./route/DeploymentCreate";
import { DeploymentList } from "./route/DeploymentList";

const dataProvider = jsonServerProvider("/api/admin");

export const Admin = React.memo(() => {
  const [isClient, setIsClient] = useState(false);
  const { status } = useSession();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  if (status !== "authenticated") {
    return <LoadingView />;
  }

  return (
    <Tushan basename="/admin" dataProvider={dataProvider}>
      <Resource
        name="deployment"
        label="Deployment"
        icon={<IconApps />}
        list={<DeploymentList />}
        create={<DeploymentCreate />}
      />
    </Tushan>
  );
});
Admin.displayName = "AdminRoot";

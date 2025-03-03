"use client";

import { useEffect, useState } from "react";
import {
  jsonServerProvider,
  Resource,
  Tushan,
  LoadingView,
  CustomRoute,
} from "tushan";
import { useSession } from "next-auth/react";
import { IconCompass, IconList, IconWifi } from "tushan/icon";
import React from "react";
import { DeploymentCreate } from "./route/DeploymentCreate";
import { DeploymentList } from "./route/DeploymentList";
import { ClientRedirect } from "../Redirect";
import { ActiveList } from "./route/ActiveList";
import { AdminGlobalModal } from "./AdminGlobalModal";
import { Navbar } from "./Navbar";
import { ChannelList } from "./route/ChannelList";
import { ApikeyPage } from "./route/ApikeyPage";
import { AdminDashboard } from "./route/Dashboard";

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

  if (status === "loading") {
    return <LoadingView />;
  }

  if (status === "unauthenticated") {
    return <ClientRedirect to="/" />;
  }

  return (
    <Tushan
      basename="/admin"
      dashboard={<AdminDashboard />}
      navbar={<Navbar />}
      dataProvider={dataProvider}
    >
      <Resource
        name="deployment"
        label="Deployment"
        icon={<IconCompass />}
        list={<DeploymentList />}
        create={<DeploymentCreate />}
      />
      <Resource
        name="active"
        label="Active"
        icon={<IconWifi />}
        list={<ActiveList />}
      />
      <Resource
        name="channel"
        label="Channel"
        icon={<IconList />}
        list={<ChannelList />}
      />
      <CustomRoute name="apikey" noMenu={true}>
        <ApikeyPage />
      </CustomRoute>
      <AdminGlobalModal />
    </Tushan>
  );
});
Admin.displayName = "AdminRoot";

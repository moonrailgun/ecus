import { api } from "@/trpc/react";
import React, { useState } from "react";
import { Card, Select, Space, Spin, Typography } from "tushan";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "tushan/chart";
import { useAdminStore } from "../useAdminStore";
import dayjs from "dayjs";
import { getDateArray, getUserTimezone } from "@/utils/date";
import { groupBy, uniq } from "lodash-es";

const colors = [
  "#8884d8", // purple
  "#82ca9d", // green
  "#ff8042", // orange
  "#a05195", // dark purple
  "#0088FE", // blue
  "#FFBB28", // yellow
  "#00C49F", // teal
  "#FF6B6B", // coral
  "#4CAF50", // forest green
  "#9C27B0", // violet
  "#FF9800", // deep orange
  "#2196F3", // light blue
  "#E91E63", // pink
  "#673AB7", // deep purple
  "#3F51B5", // indigo
  "#009688", // cyan
  "#795548", // brown
  "#607D8B", // blue grey
  "#F44336", // red
  "#CDDC39", // lime
];

function useStatsAccessLog() {
  const [dateRange, setDateRange] = useState<number>(7);
  const [selectedRuntime, setSelectedRuntime] = useState<string>("all");
  const projectId = useAdminStore((state) => state.projectId);
  const startDate = dayjs().subtract(dateRange, "day").startOf("day").toDate();
  const endDate = dayjs().endOf("day").toDate();
  const timezone = getUserTimezone();

  const { data: usage = [], isLoading } = api.deployment.statsAccess.useQuery({
    projectId,
    startDate,
    endDate,
    timezone,
  });

  const allRuntimes = uniq(usage.map((item) => item.runtimeVersion));

  const filteredUsage =
    selectedRuntime === "all"
      ? usage
      : usage.filter((item) => item.runtimeVersion === selectedRuntime);

  const allVersions = uniq(filteredUsage.map((item) => item.version));

  const groupedData = groupBy(filteredUsage, "date");

  const compressed = Object.keys(groupedData).map((date) => {
    const result: { date: string } & Record<string, unknown> = { date };

    allVersions.forEach((version) => {
      result[version] = 0;
    });

    if (groupedData[date]) {
      groupedData[date].forEach(({ version, count }) => {
        result[version] = count;
      });
    }

    return result;
  });

  const filledData = getDateArray(
    compressed,
    startDate,
    endDate,
    "day",
    timezone,
  );

  return {
    isLoading,
    accessResult: filledData,
    allVersions,
    allRuntimes,
    dateRange,
    setDateRange,
    selectedRuntime,
    setSelectedRuntime,
  };
}

export const Usage: React.FC = React.memo(() => {
  const {
    isLoading,
    accessResult,
    allVersions,
    allRuntimes,
    dateRange,
    setDateRange,
    selectedRuntime,
    setSelectedRuntime,
  } = useStatsAccessLog();

  const handleRangeChange = (value: number) => {
    setDateRange(value);
  };

  const handleRuntimeChange = (value: string) => {
    setSelectedRuntime(value);
  };

  return (
    <div className="usage-container" style={{ padding: "20px" }}>
      <div className="text-xl">Usage Statistics</div>
      <Typography.Paragraph type="secondary">
        View unique usage traffic and count to understand user behavior trends
      </Typography.Paragraph>

      <Space style={{ marginBottom: 20 }} align="center" wrap>
        <span>Time Range:</span>
        <Select
          value={dateRange}
          style={{ width: 140 }}
          onChange={handleRangeChange}
          options={[
            { value: 3, label: "Last 3 Days" },
            { value: 7, label: "Last 7 Days" },
            { value: 14, label: "Last 14 Days" },
            { value: 30, label: "Last 30 Days" },
            { value: 90, label: "Last 90 Days" },
          ]}
        />

        <span style={{ marginLeft: 20 }}>Runtime:</span>
        <Select
          value={selectedRuntime}
          style={{ width: 180 }}
          onChange={handleRuntimeChange}
          options={[
            { value: "all", label: "All Runtimes" },
            ...allRuntimes.map((runtime) => ({
              value: runtime,
              label: runtime,
            })),
          ]}
        />
      </Space>

      <div>
        <Card>
          {isLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <Spin />
            </div>
          ) : (
            <ResponsiveContainer width="100%" minHeight={400} className="pb-4">
              <AreaChart
                data={accessResult}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  label={{
                    value: "Date",
                    position: "insideBottomRight",
                    offset: -10,
                  }}
                  tickFormatter={(dateStr) => {
                    const date = new Date(dateStr);
                    return date.toISOString().split("T")[0] ?? "";
                  }}
                />
                <YAxis
                  label={{ value: "Count", angle: -90, position: "insideLeft" }}
                />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value) => Number(value).toLocaleString()}
                />

                {allVersions.map((version, i) => {
                  const currentColor = colors[i % colors.length];

                  return (
                    <Area
                      key={version}
                      type="monotone"
                      dataKey={version}
                      name={version}
                      stroke={currentColor}
                      fillOpacity={0.2}
                      fill={currentColor}
                    />
                  );
                })}
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
});

Usage.displayName = "Usage";

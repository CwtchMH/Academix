"use client";
import SearchFilter, {
  SearchFilterType,
} from "@/components/certificate/SearchFilter";
import { useCertificate } from "@/hooks/certificate/useCertificate";
import type { ApiParamsProps } from "@/services";
import { Flex } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { Fragment, useMemo, useState } from "react";

const certificate = () => {
  const [searchParams, setSearchParams] = useState<{
    courseName?: string;
    dateIssuedFrom?: string;
    dateIssuedTo?: string;
    status?: string;
  }>({});
  const [courseNameInput, setCourseNameInput] = useState<string>("");

  const apiParams = useMemo<ApiParamsProps>(() => {
    const params: ApiParamsProps = {};
    if (searchParams.courseName) params.courseName = searchParams.courseName;
    if (searchParams.status) params.status = searchParams.status;
    if (searchParams.dateIssuedFrom)
      params.issuedFrom = searchParams.dateIssuedFrom;
    if (searchParams.dateIssuedTo) params.issuedTo = searchParams.dateIssuedTo;
    return params;
  }, [searchParams]);

  const { data: certificates, loading, error } = useCertificate(apiParams);
  const statusOptions = [
    { label: "All Status", value: "" },
    { label: "Issued", value: "issued" },
    { label: "Pending", value: "pending" },
    { label: "Revoked", value: "revoked" },
  ];

  const handleChange = (
    key: keyof typeof searchParams,
    value: string | Dayjs | undefined
  ) => {
    setSearchParams((prev) => {
      const next = { ...prev } as any;
      if (key === "dateIssuedFrom" || key === "dateIssuedTo") {
        next[key] = value ? (value as Dayjs).format("YYYY-MM-DD") : undefined;
      } else {
        next[key] = value || undefined;
      }
      return next;
    });
  };

  const handleViewOnScan = (transactionHash: string) => {
    window.open(`https://testnet.snowtrace.io/tx/${transactionHash}`, "_blank");
  };

  return (
    <Fragment>
      <h1 className="font-bold text-[30px] leading-[36px]">My Certificates</h1>
      <p className="font-normal text-[16px] text-[#4A5568] leading-[24px] mt-1">
        View and manage your earned certificates.
      </p>
      <div className="mt-8 flex gap-4 w-full justify-between p-4 bg-white rounded-[8px] shadow-md mb-[32px]">
        <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Course Name
          </p>
          <SearchFilter
            type={SearchFilterType.SEARCH_INPUT}
            className="w-full min-h-[40px]"
            placeholder="Search by course name"
            value={courseNameInput}
            onChange={(v) => setCourseNameInput(v as string)}
            onEnter={(v) => handleChange("courseName", v)}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Date Issued From
          </p>
          <SearchFilter
            type={SearchFilterType.DATE_PICKER}
            className="w-full min-h-[40px]"
            placeholder="Select date"
            value={
              searchParams.dateIssuedFrom
                ? dayjs(searchParams.dateIssuedFrom)
                : undefined
            }
            onChange={(v) => handleChange("dateIssuedFrom", v)}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Date Issued To
          </p>
          <SearchFilter
            type={SearchFilterType.DATE_PICKER}
            className="w-full min-h-[40px]"
            placeholder="Select date"
            value={
              searchParams.dateIssuedTo
                ? dayjs(searchParams.dateIssuedTo)
                : undefined
            }
            onChange={(v) => handleChange("dateIssuedTo", v)}
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Status
          </p>
          <SearchFilter
            type={SearchFilterType.SELECT_INPUT}
            className="w-full min-h-[40px]"
            placeholder="Select status"
            options={statusOptions}
            value={searchParams.status}
            onChange={(v) => handleChange("status", v)}
          />
        </div>
        {/* <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Sort by
          </p>
          <SearchFilter
            type={SearchFilterType.SELECT_INPUT}
            className="w-full min-h-[40px]"
            placeholder="Select sort by"
          />
        </div> */}
      </div>
      <Flex gap={24} className="flex-wrap">
        {certificates.map((item, index) => (
          <div
            key={index}
            className="p-6 rounded-[8px] bg-white inline-block shadow-md"
          >
            <Flex gap={10}>
              <p className="font-semibold text-[20px] leading-[28px] min-w-[244px] !mb-0">
                {item?.course?.courseName}
              </p>
              <div className="text-[#166533] font-medium text-[12px] bg-[#DCFCE7] py-[2px] px-[10px] rounded-[9999px] flex items-center">
                {item?.status}
              </div>
            </Flex>
            <p className="text-[#718096] text-[14px] leading-[20px] !mt-5">
              Date Issued: {item?.issuedAt}
            </p>
            <button
              className="text-white bg-[#4B5563] text-[14px] font-semibold w-full py-3 rounded-[6px] mt-6 cursor-pointer"
              onClick={() => handleViewOnScan(item?.transactionHash || "")}
            >
              View on Scan
            </button>
          </div>
        ))}
      </Flex>
    </Fragment>
  );
};

export default certificate;

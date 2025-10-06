import SearchFilter, {
  SearchFilterType,
} from "@/components/certificate/SearchFilter";
import { Flex } from "antd";
import { Fragment } from "react";

const certificate = () => {
  const courses = [
    {
      title: "Course name",
      dateIssued: "15 June, 2023",
      status: "Verified",
    },
    {
      title: "Course name",
      dateIssued: "15 June, 2023",
      status: "Verified",
    },
    {
      title: "Course name",
      dateIssued: "15 June, 2023",
      status: "Verified",
    },
    {
      title: "Course name",
      dateIssued: "15 June, 2023",
      status: "Verified",
    },
    {
      title: "Course name",
      dateIssued: "15 June, 2023",
      status: "Verified",
    },
    {
      title: "Course name",
      dateIssued: "15 June, 2023",
      status: "Verified",
    },
    {
      title: "Course name",
      dateIssued: "15 June, 2023",
      status: "Verified",
    },
  ];

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
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Date Issued
          </p>
          <SearchFilter
            type={SearchFilterType.DATE_PICKER}
            className="w-full min-h-[40px]"
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Status
          </p>
          <SearchFilter
            type={SearchFilterType.SELECT_INPUT}
            className="w-full min-h-[40px]"
          />
        </div>
        <div className="flex-1">
          <p className="font-medium text-[14px] leading-[20px] text-[#4A5568]">
            Sort by
          </p>
          <SearchFilter
            type={SearchFilterType.SELECT_INPUT}
            className="w-full min-h-[40px]"
          />
        </div>
      </div>
      <Flex gap={24} className="flex-wrap">
        {courses.map((item, index) => (
          <div
            key={index}
            className="p-6 rounded-[8px] bg-white inline-block shadow-md"
          >
            <Flex gap={10}>
              <p className="font-semibold text-[20px] leading-[28px] min-w-[244px]">
                {item?.title}
              </p>
              <div className="text-[#166533] font-medium text-[12px] bg-[#DCFCE7] py-[2px] px-[10px] rounded-[9999px] flex items-center">
                {item?.status}
              </div>
            </Flex>
            <p className="text-[#718096] text-[14px] leading-[20px] ">
              Date Issued: {item?.dateIssued}
            </p>
            <button className="text-white bg-[#4B5563] text-[14px] font-semibold w-full py-3 rounded-[6px] mt-6">
              View & Verify
            </button>
          </div>
        ))}
      </Flex>
    </Fragment>
  );
};

export default certificate;

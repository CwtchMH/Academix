import SearchFilter, {
  SearchFilterType,
} from "@/components/certificate/SearchFilter";
import { Col, Divider, Flex, Row } from "antd";
import verifyIcon from "../../../../public/verify-icon.svg";
import Image from "next/image";

const certificateVerify = () => {
  return (
    <div className="flex flex-col justify-center">
      <h1 className="text-[#4B5563] text-[36px] font-bold leading-[40px] text-center">
        Academix
      </h1>
      <h2 className="text-[#1A202C] text-[24px] font-semibold leading-[32px] mt-4 text-center">
        Certificate Verification
      </h2>
      <p className="text-[#4A5568] text-[16px] font-normal leading-[24px] mt-2 text-center">
        Verify the authenticity of a blockchain-issued certificate.
      </p>
      <div className="bg-white p-6 rounded-[8px] shadow-md min-w-[672px] mt-[40px]">
        <div className="text-[#4A5568] text-[14px] mb-2">
          Certificate ID or Verification Code
        </div>
        <Flex gap={16}>
          <SearchFilter
            type={SearchFilterType.SEARCH_INPUT}
            placeholder="Enter the code from the certificate"
          />
          <button className="text-white bg-[#4B5563] rounded-[6px] px-[24px] py-[10px]">
            Verify
          </button>
        </Flex>
        <Divider />
        <div className="text-[#1A202C] text-[20px] font-semibold flex items-center mb-4">
          <Image src={verifyIcon} alt="verify" width={30} height={36} />
          <span>Certificate Verified</span>
        </div>
        <Row gutter={[16, 24]}>
          <Col span={12}>
            <p className="text-[#4B5563] text-[14px] font-medium">
              Course Name
            </p>
            <p className="text-[#1A202C] text-[16px] font-semibold">
              Advanced Theoretical Physics
            </p>
          </Col>
          <Col span={12}>
            <p className="text-[#4B5563] text-[14px] font-medium">
              Course Name
            </p>
            <p className="text-[#1A202C] text-[16px] font-semibold">
              Advanced Theoretical Physics
            </p>
          </Col>
          <Col span={12}>
            <p className="text-[#4B5563] text-[14px] font-medium">
              Course Name
            </p>
            <p className="text-[#1A202C] text-[16px] font-semibold">
              Advanced Theoretical Physics
            </p>
          </Col>
          <Col span={12}>
            <p className="text-[#4B5563] text-[14px] font-medium">
              Course Name
            </p>
            <p className="text-[#1A202C] text-[16px] font-semibold">
              Advanced Theoretical Physics
            </p>
          </Col>
        </Row>
      </div>
    </div>
  );
};
export default certificateVerify;

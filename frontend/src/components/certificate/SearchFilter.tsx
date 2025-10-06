import { DatePicker, Input, Select } from "antd";

export const SearchFilterType = {
  SEARCH_INPUT: "SEARCH_INPUT",
  DATE_PICKER: "DATE_PICKER",
  SELECT_INPUT: "SELECT_INPUT",
};

const SearchFilter = ({
  type,
  className,
  placeholder,
}: {
  type: string;
  className?: string;
  placeholder?: string;
}) => {
  switch (type) {
    case SearchFilterType.SEARCH_INPUT:
      return <Input className={className} placeholder={placeholder} />;
    case SearchFilterType.DATE_PICKER:
      return <DatePicker className={className} />;
    case SearchFilterType.SELECT_INPUT:
      return (
        <Select options={[]} className={className} placeholder={placeholder} />
      );
  }
  return <div>SearchFilter</div>;
};
export default SearchFilter;

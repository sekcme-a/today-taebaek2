import InquiryForm from "../../components/InquiryForm";

export default function InquiryPartner() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <InquiryForm
        title="제휴문의 접수"
        subtitle="투데이태백와 함께 성장할 기업 및 기관의 제안을 기다립니다."
        category="제휴문의"
        categoryId="partner"
        buttonText="제휴문의 접수하기"
      />
    </div>
  );
}

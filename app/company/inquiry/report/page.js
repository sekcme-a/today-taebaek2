import InquiryForm from "../../components/InquiryForm";

export default function InquiryReport() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <InquiryForm
        title="기사제보 접수"
        subtitle="투데이태백은 여러분의 소중한 제보와 의견을 기다립니다."
        category="기사제보"
        categoryId="report"
        buttonText="기사제보 접수하기"
      />
    </div>
  );
}

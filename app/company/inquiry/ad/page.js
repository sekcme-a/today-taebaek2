import InquiryForm from "../../components/InquiryForm";

export default function InquiryAd() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <InquiryForm
        title="광고문의"
        subtitle="배너 광고, 기획 기사 등 다양한 형태의 광고 상담이 가능합니다."
        category="광고문의"
        categoryId="ad"
        buttonText="광고문의 접수하기"
      />
    </div>
  );
}

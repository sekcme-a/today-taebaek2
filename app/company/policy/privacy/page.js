export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-2 border-gray-900 pb-4">
        개인정보처리방침
      </h1>
      <div className="prose prose-lg max-w-none text-gray-700 leading-loose">
        <p className="mb-6">
          {` (주)투데이태백(이하 "회사")는 「개인정보 보호법」 등 관련 법령에 따라
          이용자의 개인정보를 보호하고, 이와 관련한 고충을 신속하고 원활하게
          처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을
          수립·공개합니다.`}
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          제 1 조 (개인정보의 처리 목적)
        </h3>
        <p className="mb-6">
          회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는
          개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이
          변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할
          예정입니다.
          <br />
          1. <strong>홈페이지 회원 가입 및 관리</strong>: 회원 가입의사 확인,
          회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스
          부정이용 방지, 각종 고지·통지 등
          <br />
          2. <strong>재화 또는 서비스 제공</strong>: 콘텐츠 제공, 유료 서비스
          이용에 따른 본인인증 및 요금 결제·정산 등
          <br />
          3. <strong>마케팅 및 광고에의 활용</strong>: 신규 서비스 개발 및 맞춤
          서비스 제공, 이벤트 및 광고성 정보 제공 및 참여기회 제공 등 (선택
          사항)
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          제 2 조 (처리하는 개인정보 항목)
        </h3>
        <p className="mb-6">
          회사는 서비스 제공을 위해 필요한 최소한의 개인정보를 수집하고
          있습니다.
        </p>
        <table className="min-w-full border-collapse border border-gray-300 mb-6">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">수집 구분</th>
              <th className="border border-gray-300 p-2">수집 항목</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 p-2 font-bold italic">
                필수 항목
              </td>
              <td className="border border-gray-300 p-2">
                이름, 아이디, 비밀번호, 이메일 주소, 휴대폰 번호
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-bold italic">
                선택 항목
              </td>
              <td className="border border-gray-300 p-2">
                생년월일, 성별, 관심 분야 (뉴스 카테고리 등)
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 p-2 font-bold italic">
                자동 수집
              </td>
              <td className="border border-gray-300 p-2">
                IP주소, 쿠키, 서비스 이용 기록, 접속 로그, 기기 정보
              </td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          제 3 조 (개인정보의 처리 및 보유 기간)
        </h3>
        <p className="mb-6">
          1. 회사는 법령에 따른 개인정보 보유·이용기간 또는 이용자로부터
          개인정보를 수집 시에 동의 받은 개인정보 보유·이용기간 내에서
          개인정보를 처리·보유합니다.
          <br />
          2. <strong>회원 탈퇴 시 즉시 파기</strong>하는 것을 원칙으로 하되,
          관련 법령(상법, 전자상거래법 등)에 따라 보존할 필요가 있는 경우 해당
          기간 동안 보관합니다.
          <br />
          - 계약 또는 청약철회 등에 관한 기록: 5년
          <br />
          - 대금결제 및 재화 등의 공급에 관한 기록: 5년
          <br />- 소비자의 불만 또는 분쟁처리에 관한 기록: 3년
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          제 4 조 (개인정보의 파기 절차 및 방법)
        </h3>
        <p className="mb-6">
          회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
          불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 전자적
          파일 형태는 복구 및 재생할 수 없는 기술적 방법을 사용하여 삭제하며,
          종이 문서에 출력된 개인정보는 분쇄기로 분쇄하거나 소각합니다.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          제 5 조 (정보주체의 권리·의무 및 행사방법)
        </h3>
        <p className="mb-6">
          1. 이용자는 회사에 대해 언제든지 개인정보 열람·정정·삭제·처리정지 요구
          등의 권리를 행사할 수 있습니다.
          <br />
          2. 회사는 이용자의 권리 행사에 대해 지체 없이 조치하며, 이용자가
          개인정보의 오류에 대한 정정을 요청한 경우에는 정정을 완료하기 전까지
          해당 개인정보를 이용 또는 제공하지 않습니다.
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          제 6 조 (개인정보의 안전성 확보 조치)
        </h3>
        <p className="mb-6">
          회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고
          있습니다.
          <br />
          1. <strong>관리적 조치</strong>: 내부관리계획 수립·시행, 정기적 직원
          교육 등
          <br />
          2. <strong>기술적 조치</strong>: 개인정보처리시스템 등의 접근권한
          관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치
          <br />
          3. <strong>물리적 조치</strong>: 전산실, 자료보관실 등의 접근통제
        </p>

        <h3 className="text-xl font-bold text-gray-900 mt-12 mb-4">
          제 7 조 (개인정보 보호책임자)
        </h3>
        <p className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
          회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 이용자의
          불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를
          지정하고 있습니다.
          <br />
          <br />
          <strong>성명: 심귀자</strong>
          <br />
          <strong>연락처: 010-4891-3765</strong>
        </p>

        <p className="text-sm text-gray-500 mt-10">
          공고일자: 2026년 1월 15일 / 시행일자: 2026년 1월 15일
        </p>
      </div>
    </div>
  );
}

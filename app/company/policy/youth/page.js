export default function PolicyYouth() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-8 border-b-2 border-gray-900 pb-4">
        청소년보호정책
      </h1>
      <div className="space-y-8 text-gray-700 leading-loose">
        <p className="text-lg">
          (주)투데이태백는 각종 청소년유해정보로부터 청소년을 보호하고자 관련
          법률에 따라 19세 미만의 청소년들이 유해정보에 접근할 수 없도록
          청소년보호정책을 마련하여 시행하고 있습니다. 또한 회사는 청소년의
          건전한 성장을 저해하는 음란, 불법 등의 유해정보와 비윤리적, 반사회적
          행위에 대해서 엄격하게 제재하고 있습니다.
        </p>

        <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg border-l-4 border-l-blue-600">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            1. 유해정보로부터 청소년보호계획 수립 및 업무담당자 교육시행
          </h3>
          <p>
            회사는 청소년이 아무런 제한장치 없이 청소년 유해정보에 노출되지
            않도록 청소년유해매체물에 대해서는 별도의 인증장치를 마련, 적용하며
            청소년 유해정보가 노출되지 않기 위한 예방차원의 조치를 강구하고
            있습니다. 또한 정보통신업무 종사자를 대상으로 청소년보호 관련 법령
            및 제재기준, 유해정보 발견 시 대처방법 등을 정기적으로 교육하고
            있습니다.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg border-l-4 border-l-blue-600">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            2. 유해정보에 대한 청소년접근제한 및 관리조치
          </h3>
          <p>
            회사는 청소년이 유해정보에 노출되지 않도록 기사 내용 및 광고물에
            대해 엄격한 자체 기준을 적용하고 있습니다. 청소년에게 유해한 영향을
            미칠 수 있는 콘텐츠에 대해서는 성인인증 등의 접근 제한 조치를
            취하며, 실시간 모니터링을 통해 유해정보가 유통되지 않도록 관리하고
            있습니다.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg border-l-4 border-l-blue-600">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            3. 유해정보로 인한 피해상담 및 고충처리
          </h3>
          <p>
            회사는 청소년 유해정보로 인한 피해상담 및 고충처리를 위한 인력을
            배치하여 그 피해가 확산되지 않도록 하고 있습니다. 이용자께서는
            하단에 명시한 청소년보호 책임자 및 담당자의 연락처를 참고하여 전화나
            이메일을 통해 상담 및 고충처리를 요청하실 수 있습니다.
          </p>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg border-l-4 border-l-blue-600">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            4. 청소년보호 책임자 및 담당자 연락처
          </h3>
          <p>
            회사는 청소년 보호에 대한 의견수렴 및 불만처리를 담당하는 청소년
            보호 책임자 및 담당자를 지정 운영하고 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <ul className="bg-gray-50 p-4 rounded text-sm">
              <li className="font-bold border-b border-gray-200 mb-2 pb-1 text-blue-800">
                ■ 청소년 보호 책임담당자
              </li>
              <li>
                <strong>성명</strong> : 심귀자
              </li>
              <li>
                <strong>전화번호</strong> : 010-4891-3765
              </li>
              <li>
                <strong>이메일</strong> : bkshim21@naver.com
              </li>
            </ul>
            {/* <ul className="bg-gray-50 p-4 rounded text-sm">
              <li className="font-bold border-b border-gray-200 mb-2 pb-1 text-blue-800">
                ■ 청소년 보호 담당자
              </li>
              <li>
                <strong>성명</strong> : [담당자 성명 입력]
              </li>
              <li>
                <strong>소속/직위</strong> : [예: 운영팀 팀장]
              </li>
              <li>
                <strong>전화번호</strong> : [전화번호 입력]
              </li>
              <li>
                <strong>이메일</strong> : [이메일 주소 입력]
              </li>
            </ul> */}
          </div>
        </div>

        <div className="bg-white p-6 shadow-sm border border-gray-200 rounded-lg border-l-4 border-l-blue-600">
          <h3 className="font-bold text-lg text-gray-900 mb-2">
            5. 청소년 유해정보 신고 및 피해구제 신청
          </h3>
          <p>
            기타 불법 및 유해정보로 인한 신고가 필요하신 경우
            방송통신심의위원회의 전자민원 창구(www.kocsc.or.kr)를 이용하여
            피해구제 및 신고를 하실 수 있습니다.
          </p>
        </div>

        <p className="text-sm text-gray-500 mt-10">
          청소년보호정책 시행일자 : 2026년 1월 15일
        </p>
      </div>
    </div>
  );
}

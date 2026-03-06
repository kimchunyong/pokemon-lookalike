import Link from 'next/link'

export default function FaqPage() {
  return (
    <main className="faq-page">
      <div className="faq-page-inner">
        <h1 className="faq-page-title">자주 묻는 질문</h1>
        <p className="faq-page-lead">
          포켓몬 닮은꼴 테스트·닮은꼴 찾기 서비스에 대해 자주 묻는 질문과 답변입니다.
        </p>

        <section className="faq-section" aria-labelledby="faq-how">
          <h2 id="faq-how">닮은꼴 찾기·테스트 방법</h2>
          <dl className="faq-list">
            <dt>어떻게 나의 닮은꼴 포켓몬을 찾나요?</dt>
            <dd>
              <strong>이미지로 찾기</strong> 메뉴에서 사진 한 장을 올리면, AI가 1·2·3·4세대와 메가진화 포켓몬 공식 이미지와 비교해 유사도 순으로 결과를 보여줍니다. 회원 가입 없이도 테스트할 수 있습니다.
            </dd>
            <dt>닮은꼴 순위는 어떻게 정해지나요?</dt>
            <dd>
              업로드한 사진에서 AI가 얼굴·인상·색감 등 특징을 추출하고, 각 포켓몬 이미지의 특징과 비교해 유사도 점수를 냅니다. 전기·불꽃 같은 타입 분위기와 색감도 반영됩니다.
            </dd>
            <dt>어떤 사진을 올리면 좋나요?</dt>
            <dd>
              정면에 가깝고 얼굴이 잘 보이는 사진이 가장 정확합니다. 밝기가 적당하고 다른 얼굴이 크게 겹치지 않는 사진을 권장합니다.
            </dd>
          </dl>
        </section>

        <section className="faq-section" aria-labelledby="faq-privacy">
          <h2 id="faq-privacy">사진·개인정보</h2>
          <dl className="faq-list">
            <dt>올린 사진은 어디에 저장되나요?</dt>
            <dd>
              개인정보를 저장하지 않는 것을 원칙으로 합니다. 분석은 브라우저와 서버에서 처리되며, 원하시면 <strong>결과만</strong> 로그인 후 &quot;내 결과&quot;에 저장할 수 있습니다.
            </dd>
            <dt>비로그인으로도 이용할 수 있나요?</dt>
            <dd>
              네. 닮은꼴 테스트와 도감 조회는 로그인 없이 이용 가능합니다. 결과 저장, 랭킹 등록, 커뮤니티 글쓰기 등은 로그인 후 이용할 수 있습니다.
            </dd>
            <dt>개인정보는 어떻게 보호되나요?</dt>
            <dd>
              수집·이용 내용은 <Link href="/privacy">개인정보처리방침</Link>에 안내되어 있습니다. 로그인 시 필요한 최소 정보만 사용하며, 결과 저장 시에도 선택 사항입니다.
            </dd>
          </dl>
        </section>

        <section className="faq-section" aria-labelledby="faq-results">
          <h2 id="faq-results">결과 저장·랭킹·도감</h2>
          <dl className="faq-list">
            <dt>결과를 저장하려면 어떻게 하나요?</dt>
            <dd>
              로그인한 뒤 닮은꼴 테스트 결과 화면에서 &quot;내 결과에 저장&quot;을 누르면, <Link href="/my/results">내 결과</Link>에서 나중에 다시 볼 수 있습니다.
            </dd>
            <dt>랭킹에 등록하려면?</dt>
            <dd>
              로그인 후 결과 화면에서 &quot;랭킹에 등록&quot;을 선택하면, 가장 유사도가 높은 포켓몬 한 마리 기준으로 <Link href="/ranking">닮은꼴 랭킹</Link>에 반영됩니다. 본인이 원할 때만 등록됩니다.
            </dd>
            <dt>도감과 닮은꼴 테스트의 관계는?</dt>
            <dd>
              테스트 결과로 나온 포켓몬을 <Link href="/pokedex">포켓몬 도감</Link>에서 검색해 타입, 키, 몸무게, 진화 정보, 닮은꼴 한줄 설명까지 확인할 수 있습니다. 한국어 이름으로도 검색 가능합니다.
            </dd>
          </dl>
        </section>

        {/*<section className="faq-section" aria-labelledby="faq-ai">
          <h2 id="faq-ai">AI 분석 원리 (쉽게 설명)</h2>
          <p className="faq-section-p">
            이미지 인식 AI가 업로드한 사진에서 특징 벡터를 추출한 뒤, 각 포켓몬 공식 이미지의 특징과 비교해 &quot;얼마나 비슷한지&quot; 유사도 점수를 냅니다.
            단순한 얼굴 형태뿐 아니라 색감·분위기(예: 전기 타입·불꽃 타입 느낌)도 반영해, 전체적인 인상으로 매칭합니다.
          </p>
        </section>*/}

        <section className="faq-section" aria-labelledby="faq-etc">
          <h2 id="faq-etc">기타</h2>
          <dl className="faq-list">
            <dt>이용약관·문의는 어디서 보나요?</dt>
            <dd>
              <Link href="/terms">이용약관</Link>, <Link href="/privacy">개인정보처리방침</Link>, <Link href="/contact">문의하기</Link>는 페이지 하단 링크 또는 해당 경로에서 확인할 수 있습니다.
            </dd>
            <dt>포켓몬 저작권에 대해</dt>
            <dd>
              포켓몬은 The Pokémon Company의 저작권이 있습니다. 본 서비스는 팬·교육 목적의 비상업적 활용을 지향하며, PokeAPI 등 공개 데이터를 참고합니다.
            </dd>
          </dl>
        </section>
      </div>
    </main>
  )
}

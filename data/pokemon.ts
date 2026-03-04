/**
 * 포켓몬 목록 데이터
 * 각 포켓몬: { id, name, type, imageUrl, description }
 * 이미지 URL은 PokeAPI의 공식 아트워크를 사용합니다.
 *
 * 저작권 고지: 포켓몬은 Pokémon Company의 저작권이 있습니다.
 * 이 데이터는 PokeAPI에서 제공하는 공개 데이터를 사용하며,
 * 비상업적 교육 목적으로만 사용됩니다.
 */
export const POKEMON_LIST = [
  {
    id: 1,
    name: '이상해씨',
    type: '풀/독',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
    description: '태어날 때부터 등에 식물의 씨앗을 지니고 자라는 신기한 포켓몬',
  },
  {
    id: 4,
    name: '파이리',
    type: '불꽃',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
    description: '꼬리의 불꽃은 생명력의 상징. 건강할수록 불꽃이 강하게 타오른다',
  },
  {
    id: 7,
    name: '꼬부기',
    type: '물',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
    description: '등껍질에 숨어 몸을 보호한다. 위험하면 거품을 뿜어낸다',
  },
  {
    id: 25,
    name: '피카츄',
    type: '전기',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    description: '볼에 전기를 모아둔다. 긴장하면 방전하기도 한다',
  },
  {
    id: 39,
    name: '푸린',
    type: '노말/페어리',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png',
    description: '매우 예민한 귀로 멀리 떨어진 소리도 들을 수 있다',
  },
  {
    id: 52,
    name: '나옹',
    type: '노말',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',
    description: '밤이 되면 활동적이 된다. 반짝이는 것을 매우 좋아한다',
  },
  {
    id: 54,
    name: '고라파덕',
    type: '물',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png',
    description: '항상 두통으로 고생한다. 두통이 심해지면 이상한 힘을 쓴다',
  },
  {
    id: 66,
    name: '알통몬',
    type: '격투',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/66.png',
    description: '근육을 단련하는 것을 좋아한다. 하루 종일 운동을 계속한다',
  },
  {
    id: 92,
    name: '고오스',
    type: '고스트/독',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/92.png',
    description: '가스로 된 몸을 가졌다. 가스에 휩싸이면 기절한다',
  },
  {
    id: 104,
    name: '탕구리',
    type: '땅',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/104.png',
    description: '어머니의 뼈를 지니고 있다. 외로움을 느끼면 크게 운다',
  },
  {
    id: 133,
    name: '이브이',
    type: '노말',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
    description: '불안정한 유전자를 가진 포켓몬. 돌의 방사선에 반응해 진화한다',
  },
  {
    id: 150,
    name: '뮤츠',
    type: '에스퍼',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png',
    description: '유전자 조작으로 만들어진 포켓몬. 인간의 손으로 만들어진 생물',
  },
  {
    id: 151,
    name: '뮤',
    type: '에스퍼',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/151.png',
    description: '신비한 포켓몬. 모든 포켓몬의 유전자를 가지고 있다고 전해진다',
  },
  {
    id: 2,
    name: '이상해풀',
    type: '풀/독',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/2.png',
    description:
      '등의 꽃봉오리가 자라면서 냄새가 강해진다. 꽃봉오리가 피기 직전이 가장 향이 진하다',
  },
  {
    id: 3,
    name: '이상해꽃',
    type: '풀/독',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/3.png',
    description: '등의 큰 꽃에서 달콤한 향기가 난다. 향기에 이끌려 포켓몬이 모여든다',
  },
  {
    id: 5,
    name: '리자드',
    type: '불꽃',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/5.png',
    description: '꼬리의 불꽃이 강해지면 싸움을 좋아하는 성격으로 변한다',
  },
  {
    id: 6,
    name: '리자몬',
    type: '불꽃/비행',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
    description: '날개로 하늘을 날아 상대를 찾아낸다. 강한 상대일수록 불꽃이 세진다',
  },
  {
    id: 8,
    name: '어니부기',
    type: '물',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/8.png',
    description: '등껍질이 커져서 몸을 완전히 숨길 수 있다. 등껍질에서 물을 뿜어낸다',
  },
  {
    id: 9,
    name: '거북왕',
    type: '물',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/9.png',
    description: '등껍질에서 강력한 물대포를 발사한다. 몸을 등껍질에 숨겨 방어한다',
  },
  {
    id: 26,
    name: '라이츄',
    type: '전기',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/26.png',
    description: '꼬리를 땅에 꽂고 전기를 흘려보낸다. 주변이 번개로 뒤덮인다',
  },
  {
    id: 37,
    name: '식스테일',
    type: '불꽃',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/37.png',
    description: '6개의 꼬리가 아름답다. 꼬리가 자라면서 털의 색이 변한다',
  },
  {
    id: 38,
    name: '나인테일',
    type: '불꽃',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/38.png',
    description: '9개의 긴 꼬리를 가지고 있다. 각 꼬리마다 신비한 힘이 깃들어 있다',
  },
  {
    id: 58,
    name: '가디',
    type: '불꽃',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/58.png',
    description: '용감하고 충성스러운 성격. 주인을 지키기 위해 목숨을 바친다',
  },
  {
    id: 59,
    name: '윈디',
    type: '불꽃',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/59.png',
    description: '전설의 포켓몬. 아름다운 털을 가진 자랑스러운 포켓몬',
  },
  {
    id: 63,
    name: '케이시',
    type: '에스퍼',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/63.png',
    description: '초능력으로 주변을 감지한다. 위험을 느끼면 텔레포트로 도망간다',
  },
  {
    id: 65,
    name: '후딘',
    type: '에스퍼',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/65.png',
    description: '뇌가 발달하여 IQ가 5000이라고 한다. 초능력으로 모든 것을 해결한다',
  },
  {
    id: 94,
    name: '팬텀',
    type: '고스트/독',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/94.png',
    description: '그림자 속에 숨어 있다. 상대를 얼어붙게 만든다',
  },
  {
    id: 130,
    name: '갸라도스',
    type: '물/비행',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/130.png',
    description: '분노하면 붉은 갈기가 타오른다. 분노의 화염으로 모든 것을 태운다',
  },
  {
    id: 143,
    name: '잠만보',
    type: '노말',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
    description: '하루에 20시간은 잠을 잔다. 자는 동안 배가 고파도 깨지 않는다',
  },
  {
    id: 144,
    name: '프리져',
    type: '얼음/비행',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/144.png',
    description: '전설의 새 포켓몬. 날개짓으로 공기를 얼려서 눈보라를 만든다',
  },
  {
    id: 145,
    name: '썬더',
    type: '전기/비행',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/145.png',
    description: '전설의 새 포켓몬. 번개를 조종하여 천둥을 일으킨다',
  },
  {
    id: 146,
    name: '파이어',
    type: '불꽃/비행',
    imageUrl:
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/146.png',
    description: '전설의 새 포켓몬. 불꽃의 날개로 하늘을 나는 모습이 장관이다',
  },
]

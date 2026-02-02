import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <main className="home-page">
      <h1>나와 닮은 포켓몬스터</h1>
      <p>나와 닮은 포켓몬을 찾아보세요!</p>
      
      <div className="option-buttons">
        <Link to="/image-compare">
          <button type="button" className="primary-button">
            📷 이미지로 찾기
          </button>
        </Link>
        {/*<Link to="/quiz">
          <button type="button" className="secondary-button">
            ❓ 퀴즈로 찾기
          </button>
        </Link>*/}
      </div>
    </main>
  )
}

export default HomePage;
